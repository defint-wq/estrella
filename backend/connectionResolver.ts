import "dotenv/config";
import mongoose from "mongoose";
// 👇 Шинэ моделиудыг импортлохдоо .js өргөтгөл нэмэв:
import { IPatientModel, loadPatientClass } from "./src/database/models/Patients.js";
import { IAppointmentModel, loadAppointmentClass } from "./src/database/models/Appointments.js";
import {
  IEmployeeModel,
  loadEmployeeModel,
} from "./src/database/models/Employees.js";
import { loadAuthSessionModel } from "./src/database/models/AuthSessions.js";
import type { IAuthUser } from "./@types/Employee.js";

const uri = process.env.MONGO_URL;

const mongooseConnectionOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
} as mongoose.ConnectOptions;

export interface IModels {
  Patients: IPatientModel;
  Appointments: IAppointmentModel;
  Employees: IEmployeeModel;
  AuthSessions: ReturnType<typeof loadAuthSessionModel>;
}

export interface IContext {
  models: IModels;
  authUser?: IAuthUser;
}

let models: IModels | null = null;

export const getContext = (authUser?: IAuthUser): IContext => {
  return { models: getModels(), authUser };
};

export const initModels = () => {
  const models = {} as IModels;
  models.Patients = loadPatientClass(models);
  models.Appointments = loadAppointmentClass(models);
  models.Employees = loadEmployeeModel();
  models.AuthSessions = loadAuthSessionModel();
  return models;
};

export const getModels = (): IModels => {
  if (!models) throw new Error("Models not initialized");
  return models;
};

mongoose.connection
  .on("connected", () => {
    console.log("Connected to the database");
  })
  .on("disconnected", () => {
    console.log("Disconnected from database");
  })
  .on("error", (error: Error) => {
    console.error("Database connection error:", error.message);
  })
  .on("close", () => {});

export async function connect(): Promise<mongoose.Connection> {
  if (!uri) throw new Error("MONGO_URL is not defined");

  try {
    await mongoose.connect(uri, mongooseConnectionOptions);
  } catch (err) {
    console.error("Mongo connect failed:", (err as Error).message);
    throw err;
  }

  models = initModels();
  return mongoose.connection;
}

export async function closeMongoose() {
  try {
    await mongoose.connection.close();
    console.log("Mongoose connection disconnected");
  } catch (e) {
    console.error(e);
  }
}