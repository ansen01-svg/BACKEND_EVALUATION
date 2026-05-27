import mongoose, { Document, Schema } from "mongoose";
import { EventType, IProduct } from "../types";

export interface ProductDocument extends Omit<IProduct, "_id">, Document {}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    partnerId: { type: String, required: true, index: true },
    currentStatus: {
      type: String,
      enum: Object.values(EventType),
      default: EventType.MANUFACTURED,
    },
  },
  { timestamps: true },
);

// Compound index for filtered list queries at scale
ProductSchema.index({ partnerId: 1, currentStatus: 1, createdAt: -1 });
ProductSchema.index({ currentStatus: 1, createdAt: -1 });
ProductSchema.index({ createdAt: -1 });

export const Product = mongoose.model<ProductDocument>(
  "Product",
  ProductSchema,
);
