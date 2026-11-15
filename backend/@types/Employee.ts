import { Document, Types } from "mongoose";

export type EmployeeRole = "ADMIN" | "RECEPTION" | "DOCTOR";
export type EmployeeGender = "MALE" | "FEMALE";

export interface IEmployee {
  name: string;
  firstName?: string;
  lastName?: string;
  age: number;
  gender: EmployeeGender;
  phone: string;
  registerNumber: string;
  username: string;
  password: string;
  role: EmployeeRole;
}

export interface IEmployeeDocument extends IEmployee, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthUser {
  _id: string;
  username: string;
  name: string;
  role: EmployeeRole;
}
