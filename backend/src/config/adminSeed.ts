import type { IEmployee } from "../../@types/Employee.js";
import type { IModels } from "../../connectionResolver.js";

const getAdminSeed = (): IEmployee => {
  const password = process.env.ADMIN_PASSWORD;
  if (
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new Error(
      "ADMIN_PASSWORD must contain at least 12 characters and at most 72 UTF-8 bytes.",
    );
  }

  const age = Number(process.env.ADMIN_AGE ?? 30);
  if (!Number.isInteger(age) || age < 0) {
    throw new Error("ADMIN_AGE must be a non-negative integer.");
  }

  const gender = process.env.ADMIN_GENDER ?? "MALE";
  if (gender !== "MALE" && gender !== "FEMALE") {
    throw new Error("ADMIN_GENDER must be MALE or FEMALE.");
  }

  return {
    name: process.env.ADMIN_NAME?.trim() || "System Administrator",
    age,
    gender,
    phone: process.env.ADMIN_PHONE?.trim() || "0000000000",
    registerNumber:
      process.env.ADMIN_REGISTER_NUMBER?.trim() || "ADMIN-INITIAL",
    username: process.env.ADMIN_USERNAME?.trim().toLowerCase() || "admin",
    password,
    role: "ADMIN",
  };
};

export const seedInitialAdmin = async (models: IModels) => {
  const seed = getAdminSeed();
  const existing = await models.Employees.findOne({ username: seed.username });
  if (existing) {
    if (existing.role !== "ADMIN") {
      throw new Error(
        `ADMIN_USERNAME "${seed.username}" already belongs to a non-admin employee.`,
      );
    }
    return;
  }

  await models.Employees.create(seed);
  console.log(`Seeded initial ADMIN account: ${seed.username}`);
};
