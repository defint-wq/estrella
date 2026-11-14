import { model, Schema } from "mongoose";
import { IAppointmentDocument } from "../../../@types/Appointment.js";

export const appointmentSchema = new Schema(
  {
    // Аль өвчтөнд хамааралтайг заах холбоос (Reference)
    patientId: { type: Schema.Types.ObjectId, ref: "Patients", required: true },
    startTime: { type: Date, required: true },
    endTime: {type: Date, required: true},
    doctorName: { type: String, required: true },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
    diagnosis: { type: String },
    examinationNotes: { type: String, trim: true },
    symptoms: { type: String, trim: true },
    treatment: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export const AppointmentModel = model<IAppointmentDocument>("Appointment", appointmentSchema);