import mongoose, { type Model } from "mongoose";
import type { IEmployeeDocument } from "../../../@types/Employee.js";
import { employeeSchema } from "../definition/employees.js";

export type IEmployeeModel = Model<IEmployeeDocument>;

export const loadEmployeeModel = () =>
  mongoose.model<IEmployeeDocument, IEmployeeModel>("Employees", employeeSchema);
