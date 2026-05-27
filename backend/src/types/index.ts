import { Request } from "express";
import { Types } from "mongoose";

export enum UserRole {
  INTERNAL = "internal",
  PARTNER = "partner",
}

export enum EventType {
  MANUFACTURED = "manufactured",
  IN_TRANSIT = "in_transit",
  SHIPPED = "shipped",
  RECEIVED = "received",
  INSPECTED = "inspected",
  STORED = "stored",
  SOLD = "sold",
  RETURNED = "returned",
  RECYCLED = "recycled",
  RECALLED = "recalled",
  DISPOSED = "disposed",
}

export interface JwtPayload {
  userId: string;
  role_id: number;
  role: UserRole;
  partnerId?: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  sku: string;
  description?: string;
  partnerId: string;
  currentStatus: EventType;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sequenceNumber: number;
  type: EventType;
  timestamp: Date;
  location: string;
  performedBy: string;
  metadata: Record<string, unknown>;
  previousHash: string | null;
  hash: string;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  password: string;
  role_id: number;
  partnerId?: string;
}
