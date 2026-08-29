import { Document, Types } from "mongoose";
import { IAppointmentDocument } from "./Appointment.js";

export type SexStatus = "MALE" | "FEMALE";
// 1. Бааз руу шинээр илгээх өгөгдлийн бүтэц
export interface IPatient {
  registrationNumber: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: SexStatus;
  appointments?: Types.ObjectId[] | IAppointmentDocument[];
}

// 2. Баазаас буцаж ирэх Mongoose Document-ийн бүтэц (_id болон цаг хугацаатай)
export interface IPatientDocument extends IPatient, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
