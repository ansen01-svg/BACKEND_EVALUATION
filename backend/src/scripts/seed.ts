import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Event, Product, User } from "../models";
import { EventType, JwtPayload } from "../types";
import { USER_ROLES } from "../utils/constants";
import { computeEventHash } from "../utils/hash";

dotenv.config();

const MONGO_CONNECTION_STRING = process.env.MONGO_URL_DEV;
const JWT_SECRET = process.env.JWT_SECRET;

async function seed() {
  await mongoose.connect(MONGO_CONNECTION_STRING as string);
  console.log("Connected to MongoDB for seeding...\n");

  // Drop collections to clear stale indexes
  await User.collection.drop().catch(() => {});
  await Product.collection.drop().catch(() => {});
  await Event.collection.drop().catch(() => {});

  // Recreate indexes from schema definitions
  await User.syncIndexes();
  await Product.syncIndexes();
  await Event.syncIndexes();

  // ── Users ──────────────────────────────────────────────
  const internalUser = await User.create({
    email: "admin@lw3.world",
    name: "LW3 Admin",
    password: "admin123",
    role_id: USER_ROLES.INTERNAL,
  });

  const partnerUser = await User.create({
    email: "partner@acme.com",
    name: "ACME Partner",
    password: "partner123",
    role_id: USER_ROLES.PARTNER,
    partnerId: "acme-corp",
  });

  const partnerUser2 = await User.create({
    email: "partner@globex.com",
    name: "Globex Partner",
    password: "partner123",
    role_id: USER_ROLES.PARTNER,
    partnerId: "globex-inc",
  });

  // ── Generate JWT tokens ────────────────────────────────
  const generateToken = (user: any): string => {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      role_id: user.role_id,
      email: user.email,
      ...(user.partnerId && { partnerId: user.partnerId }),
    };
    return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "30d" });
  };

  const internalToken = generateToken(internalUser);
  const partnerToken = generateToken(partnerUser);
  const partnerToken2 = generateToken(partnerUser2);

  // ── Products with event chains ─────────────────────────
  const productsData = [
    {
      name: "Lakadong Turmeric Batch #2024-A",
      sku: "LT-2024-001",
      description: "Premium GI-tagged turmeric from Meghalaya",
      partnerId: "acme-corp",
      events: [
        { type: EventType.MANUFACTURED, location: "Jowai, Meghalaya" },
        {
          type: EventType.INSPECTED,
          location: "Jowai Quality Lab",
          metadata: { grade: "A+", curcuminContent: "7.2%" },
        },
        {
          type: EventType.SHIPPED,
          location: "Guwahati Logistics Hub",
          metadata: { carrier: "BlueDart", trackingId: "BD-98765" },
        },
        { type: EventType.RECEIVED, location: "Mumbai Warehouse" },
      ],
    },
    {
      name: "EV Battery Module M-100",
      sku: "EV-BAT-M100-001",
      description: "Lithium-ion battery module for electric vehicles",
      partnerId: "acme-corp",
      events: [
        { type: EventType.MANUFACTURED, location: "Chennai Factory" },
        {
          type: EventType.INSPECTED,
          location: "Chennai QC",
          metadata: { voltage: "400V", capacity: "100kWh", passed: true },
        },
        {
          type: EventType.SHIPPED,
          location: "Chennai Port",
          metadata: { carrier: "Maersk", containerId: "MSKU-1234567" },
        },
      ],
    },
    {
      name: "Organic Green Hydrogen Cylinder",
      sku: "GH-CYL-2024-001",
      description: "Compressed green hydrogen for industrial use",
      partnerId: "globex-inc",
      events: [
        { type: EventType.MANUFACTURED, location: "Vizag Green Energy Plant" },
        {
          type: EventType.STORED,
          location: "Vizag Storage Facility",
          metadata: { pressure: "700bar", temperature: "-253°C" },
        },
      ],
    },
  ];

  for (const pData of productsData) {
    const product = await Product.create({
      name: pData.name,
      sku: pData.sku,
      description: pData.description,
      partnerId: pData.partnerId,
      currentStatus: pData.events[pData.events.length - 1].type,
    });

    let previousHash: string | null = null;

    for (let i = 0; i < pData.events.length; i++) {
      const eventInput = {
        productId: product._id.toString(),
        sequenceNumber: i,
        type: pData.events[i].type,
        timestamp: new Date(Date.now() - (pData.events.length - i) * 86400000), // stagger by day
        location: pData.events[i].location,
        performedBy: internalUser._id.toString(),
        metadata: pData.events[i].metadata || {},
      };

      const hash = computeEventHash(eventInput, previousHash);

      await Event.create({
        ...eventInput,
        productId: product._id,
        previousHash,
        hash,
      });

      previousHash = hash;
    }

    console.log(
      `✓ Created product: ${pData.name} (${pData.events.length} events)`,
    );
  }

  // ── Print tokens ───────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════");
  console.log("  JWT TOKENS FOR TESTING");
  console.log("═══════════════════════════════════════════════\n");

  console.log("INTERNAL (full access):");
  console.log(`  Email: admin@lw3.world`);
  console.log(`  Token: ${internalToken}\n`);

  console.log("PARTNER — ACME (read-only, scoped):");
  console.log(`  Email: partner@acme.com`);
  console.log(`  Token: ${partnerToken}\n`);

  console.log("PARTNER — Globex (read-only, scoped):");
  console.log(`  Email: partner@globex.com`);
  console.log(`  Token: ${partnerToken2}\n`);

  console.log("═══════════════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("Seed complete. Database disconnected.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
