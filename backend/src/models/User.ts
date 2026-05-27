import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../types";

export interface UserDocument extends Omit<IUser, "_id">, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role_id: { type: Number, required: true },
    partnerId: { type: String, index: true },
  },
  { timestamps: true },
);

export const User = mongoose.model<UserDocument>("User", UserSchema);
