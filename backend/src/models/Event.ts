import mongoose, { Document, Schema } from "mongoose";
import { EventType, IEvent } from "../types";

export interface EventDocument extends Omit<IEvent, "_id">, Document {}

const EventSchema = new Schema<EventDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    sequenceNumber: { type: Number, required: true, min: 0 },
    type: { type: String, enum: Object.values(EventType), required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    location: { type: String, required: true, trim: true },
    performedBy: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    previousHash: { type: String, default: null },
    hash: { type: String, required: true },
  },
  {
    timestamps: false,
  },
);

// Unique compound index — prevents duplicate sequence numbers per product
EventSchema.index({ productId: 1, sequenceNumber: 1 }, { unique: true });
// Index for chain verification lookups
EventSchema.index({ productId: 1, hash: 1 });

// ═══════════════════════════════════════════════════════════════
// APPEND-ONLY ENFORCEMENT — defense in depth at the data layer
// Even if someone bypasses routes, the model itself rejects mutations
// ═══════════════════════════════════════════════════════════════

const IMMUTABLE_ERROR =
  "Events are immutable — append-only. Modifications are not permitted.";

EventSchema.pre("updateOne", function () {
  throw new Error(IMMUTABLE_ERROR);
});

EventSchema.pre("findOneAndUpdate", function () {
  throw new Error(IMMUTABLE_ERROR);
});

EventSchema.pre("deleteOne", function () {
  throw new Error(IMMUTABLE_ERROR);
});

EventSchema.pre("findOneAndDelete", function () {
  throw new Error(IMMUTABLE_ERROR);
});

EventSchema.pre("deleteMany", function () {
  throw new Error(IMMUTABLE_ERROR);
});

// Also block updateMany
EventSchema.pre("updateMany", function () {
  throw new Error(IMMUTABLE_ERROR);
});

// Block findOneAndReplace
EventSchema.pre("findOneAndReplace", function () {
  throw new Error(IMMUTABLE_ERROR);
});

export const Event = mongoose.model<EventDocument>("Event", EventSchema);
