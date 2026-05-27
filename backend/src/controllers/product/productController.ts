import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Event, Product } from "../../models";
import { verifyEventChain } from "../../services/chainService";
import { EventType } from "../../types";
import { USER_ROLES } from "../../utils/constants";
import { computeEventHash } from "../../utils/hash";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "../../utils/pagination";

/**
 * POST /api/products
 * Register a new product — auto-creates a genesis "manufactured" event.
 */
export const createProduct = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { name, sku, description, partnerId } = req.body;

    if (!name || !sku || !partnerId) {
      res.status(400).json({ error: "name, sku, and partnerId are required" });
      return;
    }

    const existing = await Product.findOne({ sku }).session(session);
    if (existing) {
      await session.abortTransaction();
      res
        .status(409)
        .json({ error: `Product with SKU "${sku}" already exists` });
      return;
    }

    const product = new Product({
      name,
      sku,
      description,
      partnerId,
      currentStatus: EventType.MANUFACTURED,
    });

    await product.save({ session });

    const genesisEvent = {
      productId: product._id.toString(),
      sequenceNumber: 0,
      type: EventType.MANUFACTURED,
      timestamp: new Date(),
      location: req.body.location || "Origin",
      performedBy: req.user!.userId,
      metadata: req.body.metadata || {},
    };

    const hash = computeEventHash(genesisEvent, null);

    const event = new Event({
      ...genesisEvent,
      productId: product._id,
      previousHash: null,
      hash,
    });

    await event.save({ session });
    await session.commitTransaction();

    res.status(201).json({ product, genesisEvent: event });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Create product error:", error);

    if (error.code === 11000) {
      res
        .status(409)
        .json({ error: "Duplicate SKU or event sequence conflict" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
};

/**
 * POST /api/products/:id/events
 * Append a lifecycle event to the hash chain.
 */
export const addEvent = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const product = await Product.findById(id).session(session);
    if (!product) {
      await session.abortTransaction();
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const { type, location, metadata } = req.body;

    if (!type || !location) {
      await session.abortTransaction();
      res.status(400).json({ error: "type and location are required" });
      return;
    }

    if (!Object.values(EventType).includes(type)) {
      await session.abortTransaction();
      res.status(400).json({
        error: `Invalid event type. Must be one of: ${Object.values(EventType).join(", ")}`,
      });
      return;
    }

    const lastEvent = await Event.findOne({ productId: id })
      .sort({ sequenceNumber: -1 })
      .session(session);

    if (!lastEvent) {
      await session.abortTransaction();
      res
        .status(500)
        .json({ error: "Product has no genesis event — data integrity issue" });
      return;
    }

    const newSequence = lastEvent.sequenceNumber + 1;

    const eventData = {
      productId: id,
      sequenceNumber: newSequence,
      type,
      timestamp: new Date(),
      location,
      performedBy: req.user!.userId,
      metadata: metadata || {},
    };

    const hash = computeEventHash(eventData, lastEvent.hash);

    const event = new Event({
      ...eventData,
      productId: new Types.ObjectId(id),
      previousHash: lastEvent.hash,
      hash,
    });

    await event.save({ session });

    product.currentStatus = type;
    await product.save({ session });

    await session.commitTransaction();
    res.status(201).json(event);
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Append event error:", error);

    if (error.code === 11000) {
      res.status(409).json({
        error: "Sequence number conflict — concurrent write detected. Retry.",
      });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/products/:id/verify
 * Walk the event chain and verify hash integrity.
 */
export const verifyProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (
      req.user!.role_id === USER_ROLES.PARTNER &&
      product.partnerId !== req.user!.partnerId
    ) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const result = await verifyEventChain(id);
    res.json({ productId: id, productName: product.name, ...result });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/products/:id
 * Product detail with full event timeline.
 */
export const getProduct = async (req: Request, res: Response) => {
  const id = (req as any).params.id as string;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  try {
    const product = await Product.findById(id).lean();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (
      req.user!.role_id === USER_ROLES.PARTNER &&
      product.partnerId !== req.user!.partnerId
    ) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const events = await Event.find({ productId: id })
      .sort({ sequenceNumber: 1 })
      .lean();

    res.json({ ...product, events });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/products
 * List products with filters and cursor-based pagination.
 */
export const listProducts = async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = parsePaginationParams(req.query as any);
    const { status, partnerId, fromDate, toDate } = req.query;

    const filter: Record<string, any> = {};

    if (req.user!.role_id === USER_ROLES.PARTNER) {
      filter.partnerId = req.user!.partnerId;
    } else if (partnerId) {
      filter.partnerId = partnerId;
    }

    if (status) {
      if (!Object.values(EventType).includes(status as EventType)) {
        res.status(400).json({
          error: `Invalid status filter. Must be one of: ${Object.values(EventType).join(", ")}`,
        });
        return;
      }
      filter.currentStatus = status;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate as string);
      if (toDate) filter.createdAt.$lte = new Date(toDate as string);
    }

    if (cursor) {
      filter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const products = await Product.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    res.json(buildPaginatedResponse(products, limit));
  } catch (error) {
    console.error("List products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listPartners = async (req: Request, res: Response) => {
  try {
    const { cursor, limit } = parsePaginationParams(req.query as any);
    const { status, partnerId, fromDate, toDate } = req.query;

    const filter: Record<string, any> = {};

    if (req.user!.role_id === USER_ROLES.PARTNER) {
      filter.partnerId = req.user!.partnerId;
    } else if (partnerId) {
      filter.partnerId = partnerId;
    }

    if (status) {
      if (!Object.values(EventType).includes(status as EventType)) {
        res.status(400).json({
          error: `Invalid status filter. Must be one of: ${Object.values(EventType).join(", ")}`,
        });
        return;
      }
      filter.currentStatus = status;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate as string);
      if (toDate) filter.createdAt.$lte = new Date(toDate as string);
    }

    if (cursor) {
      filter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const products = await Product.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    res.json(buildPaginatedResponse(products, limit));
  } catch (error) {
    console.error("List products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
