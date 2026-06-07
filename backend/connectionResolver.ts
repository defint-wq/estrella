import "dotenv/config";
import mongoose from "mongoose";
// 1. Шинэ моделиуд болон тэдгээрийн интерфэйсүүдийг импортлох
import { IPatientModel, loadPatientClass } from "./src/database/models/Patients";
import { IAppointmentModel, loadAppointmentClass } from "./src/database/models/Appointments";

const uri = process.env.MONGO_URL;

const mongooseConnectionOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// 2. Моделийн түлхүүрүүдийг олон тоо (Patients, Appointments) болгов
  export interface IModels {
    Patients: IPatientModel;
    Appointments: IAppointmentModel;
  }

  export interface IContext {
    models: IModels;
  }

let models: IModels | null = null;

export const getContext = (): IContext => {
  return { models: getModels() };
};

// 3. Классуудыг ачаалахдаа шинэчлэгдсэн нэрээр оноож өгөх
export const initModels = () => {
  const models = {} as IModels;
  models.Patients = loadPatientClass(models);
  models.Appointments = loadAppointmentClass(models);
  return models;
};

export const getModels = (): IModels => {
  if (!models) throw new Error("Models not initialized");
  return models;
};

mongoose.connection
  .on("connected", () => {
    console.log(`Connected to the database: ${uri}`);
  })
  .on("disconnected", () => {
    console.log(`Disconnected from database: ${uri}`);
    process.exit(1);
  })
  .on("error", (error) => {
    console.error(`Database connection error: ${uri}, ${error}`);
    process.exit(1);
  })
  .on("close", () => {});

export async function connect(): Promise<mongoose.Connection> {
  if (!uri) throw new Error("URI is not defined");

  await mongoose.connect(uri, mongooseConnectionOptions);

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