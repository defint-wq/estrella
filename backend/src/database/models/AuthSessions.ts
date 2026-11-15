import mongoose, { type Document, type Model, type Types } from "mongoose";
import { authSessionSchema } from "../definition/authSession.js";

export interface IAuthSessionDocument extends Document {
  tokenHash: string;
  employeeId: Types.ObjectId;
  expiresAt: Date;
}

export const loadAuthSessionModel = () =>
  mongoose.model<IAuthSessionDocument, Model<IAuthSessionDocument>>(
    "AuthSessions",
    authSessionSchema,
  );
