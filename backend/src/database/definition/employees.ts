import { Schema } from "mongoose";
import bcrypt from "bcryptjs";

export const employeeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE"], required: true },
    phone: { type: String, required: true, trim: true },
    registerNumber: { type: String, required: true, unique: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "RECEPTION", "DOCTOR"],
      required: true,
    },
  },
  { timestamps: true },
);

employeeSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});
