import { Schema } from "mongoose";

export const authSessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);
