import { Document, Types } from "mongoose";

// Уулзалтын төлвийн төрлүүд
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

// 1. Бааз руу шинээр илгээх өгөгдлийн бүтэц
export interface IAppointment {
  patientId: Types.ObjectId | string;
  startTime: Date;
  endTime: Date;
  doctorName: string;
  status?: AppointmentStatus;
  diagnosis?: string;
}

// 2. Баазаас буцаж ирэх Mongoose Document-ийн бүтэц (_id болон цаг хугацаатай)
export interface IAppointmentDocument extends IAppointment, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}