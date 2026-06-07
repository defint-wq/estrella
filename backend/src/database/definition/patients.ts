import { Schema } from "mongoose";

export const patientSchema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, enum: ["MALE", "FEMALE"] },
    // Өвчтөнтэй холбоотой уулзалтуудын ID-нуудыг хадгалах холбоос (Reference)
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointments" }],
  },
  {
    timestamps: true, // Үүсгэсэн, өөрчилсөн огноог (createdAt, updatedAt) автоматаар хөтөлнө
  },
);
