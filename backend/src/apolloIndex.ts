import { ApolloServer } from "@apollo/server";
import { GraphQLDateTime } from "graphql-scalars";
import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { IContext } from "../connectionResolver.js";
import { requireRoles } from "./auth/session.js";
import { appointmentMutations } from "./graphql/mutations/appointments.js";
import { patientMutations } from "./graphql/mutations/patients.js";
import { appointmentQueries } from "./graphql/queries/appointments.js";
import { patientQueries } from "./graphql/queries/patients.js";
import { mutations, queries, types } from "./graphql/schemas/patients.js";
import { parseEmployeeRegisterNumber } from "./utils/employeeRegistration.js";
import type { EmployeeRole } from "../@types/Employee.js";

const typeDefs = `
  ${types()}
  type Query { ${queries} }
  type Mutation { ${mutations} }
`;

type CreateEmployeeArgs = {
  firstName: string;
  lastName: string;
  phone: string;
  registerNumber: string;
  username: string;
  password: string;
  role: "ADMIN" | "RECEPTION" | "DOCTOR";
};

const createEmployee = async (
  _parent: unknown,
  args: CreateEmployeeArgs,
  context: IContext,
) => {
  requireRoles(context.authUser, "ADMIN");
  const registration = parseEmployeeRegisterNumber(args.registerNumber);
  if (
    (args.role !== "DOCTOR" && args.role !== "RECEPTION") ||
    !args.firstName.trim() ||
    !args.lastName.trim() ||
    !args.phone.trim() ||
    !registration ||
    !args.username.trim() ||
    args.password.length < 12 ||
    Buffer.byteLength(args.password, "utf8") > 72
  ) {
    throw new GraphQLError("Invalid employee details.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  return context.models.Employees.create({
    firstName: args.firstName.trim(),
    lastName: args.lastName.trim(),
    name: `${args.lastName.trim()} ${args.firstName.trim()}`,
    age: registration.age,
    gender: registration.gender,
    phone: args.phone.trim(),
    registerNumber: registration.registerNumber,
    username: args.username.trim().toLowerCase(),
    password: args.password,
    role: args.role,
  });
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MAX_AVATAR_URL_LENGTH = 2048;

const normalizeEmployeeAvatar = (
  avatar: string | null | undefined,
): string | null | undefined => {
  if (avatar === undefined) return undefined;
  if (avatar === null || !avatar.trim()) return null;

  const value = avatar.trim();
  if (value.startsWith("data:")) {
    const match = value.match(
      /^data:image\/(?:png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/i,
    );
    if (
      !match ||
      Buffer.byteLength(Buffer.from(match[1], "base64")) > MAX_AVATAR_BYTES
    ) {
      throw new GraphQLError(
        "Avatar must be a PNG, JPEG, WebP, or GIF image under 2 MB.",
        { extensions: { code: "BAD_USER_INPUT" } },
      );
    }
    return value;
  }

  if (value.length > MAX_AVATAR_URL_LENGTH) {
    throw new GraphQLError("Avatar URL is too long.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new GraphQLError("Avatar must be a valid HTTP(S) URL or image.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new GraphQLError("Avatar must be a valid HTTP(S) URL or image.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  return value;
};

type UpdateEmployeeArgs = {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  username?: string | null;
  registerNumber?: string | null;
  avatar?: string | null;
  role?: EmployeeRole | null;
};

const updateEmployee = async (
  _parent: unknown,
  args: UpdateEmployeeArgs,
  context: IContext,
) => {
  requireRoles(context.authUser, "ADMIN");
  if (!mongoose.Types.ObjectId.isValid(args._id)) {
    throw new GraphQLError("Invalid employee ID.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const employee = await context.models.Employees.findById(args._id);
  if (!employee) {
    throw new GraphQLError("Employee not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }
  if (employee.role === "ADMIN") {
    throw new GraphQLError("Administrator accounts cannot be edited here.", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  const values = [
    args.firstName,
    args.lastName,
    args.phone,
    args.username,
    args.registerNumber,
  ];
  if (
    values.some((value) => value !== undefined && value !== null && !value.trim()) ||
    (args.role != null && args.role !== "DOCTOR" && args.role !== "RECEPTION")
  ) {
    throw new GraphQLError("Invalid employee details.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  if (
    values.every((value) => value === undefined || value === null) &&
    args.role == null &&
    args.avatar === undefined
  ) {
    throw new GraphQLError("At least one field must be provided.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const updates: {
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    username?: string;
    registerNumber?: string;
    age?: number;
    gender?: "MALE" | "FEMALE";
    avatar?: string | null;
    role?: "DOCTOR" | "RECEPTION";
  } = {};
  if (args.username != null) {
    const username = args.username.trim().toLowerCase();
    const existing = await context.models.Employees.findOne({
      username,
      _id: { $ne: employee._id },
    });
    if (existing) {
      throw new GraphQLError("This username is already in use.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    updates.username = username;
  }

  if (args.registerNumber != null) {
    const registration = parseEmployeeRegisterNumber(args.registerNumber);
    if (!registration) {
      throw new GraphQLError("Invalid employee registration number.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    const existing = await context.models.Employees.findOne({
      registerNumber: registration.registerNumber,
      _id: { $ne: employee._id },
    });
    if (existing) {
      throw new GraphQLError(
        "This registration number is already in use.",
        { extensions: { code: "BAD_USER_INPUT" } },
      );
    }
    updates.registerNumber = registration.registerNumber;
    updates.age = registration.age;
    updates.gender = registration.gender;
  }

  if (args.avatar !== undefined) {
    updates.avatar = normalizeEmployeeAvatar(args.avatar);
  }
  if (args.firstName != null) updates.firstName = args.firstName.trim();
  if (args.lastName != null) updates.lastName = args.lastName.trim();
  if (args.phone != null) updates.phone = args.phone.trim();
  if (args.role != null) updates.role = args.role;
  if (args.firstName != null || args.lastName != null) {
    updates.name = `${updates.lastName ?? employee.lastName ?? ""} ${
      updates.firstName ?? employee.firstName ?? ""
    }`.trim();
  }

  const updatedEmployee = await context.models.Employees.findOneAndUpdate(
    { _id: employee._id, role: { $in: ["DOCTOR", "RECEPTION"] } },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!updatedEmployee) {
    throw new GraphQLError("Employee not found or cannot be edited.", {
      extensions: { code: "NOT_FOUND" },
    });
  }
  return updatedEmployee;
};

const deleteEmployee = async (
  _parent: unknown,
  args: { _id: string },
  context: IContext,
) => {
  requireRoles(context.authUser, "ADMIN");
  if (!mongoose.Types.ObjectId.isValid(args._id)) {
    throw new GraphQLError("Invalid employee ID.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  if (context.authUser?._id === args._id) {
    throw new GraphQLError("You cannot delete your active account.", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  const employee = await context.models.Employees.findById(args._id);
  if (!employee) {
    throw new GraphQLError("Employee not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }
  if (employee.role === "ADMIN") {
    throw new GraphQLError("Administrator accounts cannot be deleted here.", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const result = await context.models.Employees.deleteOne(
        { _id: employee._id, role: { $in: ["DOCTOR", "RECEPTION"] } },
        { session },
      );
      if (result.deletedCount !== 1) {
        throw new GraphQLError("Employee not found or cannot be deleted.", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await context.models.AuthSessions.deleteMany(
        { employeeId: employee._id },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return "Employee deleted successfully.";
};

type UpdateMyProfileArgs = {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  password?: string | null;
  avatar?: string | null;
};

const updateMyProfile = async (
  _parent: unknown,
  args: UpdateMyProfileArgs,
  context: IContext,
) => {
  requireRoles(context.authUser, "ADMIN", "RECEPTION", "DOCTOR");

  for (const value of [args.firstName, args.lastName, args.phone]) {
    if (value !== undefined && value !== null && !value.trim()) {
      throw new GraphQLError("Profile fields cannot be blank.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
  }
  if (
    args.password &&
    (args.password.length < 12 ||
      Buffer.byteLength(args.password, "utf8") > 72)
  ) {
    throw new GraphQLError("Password must be 12-72 UTF-8 bytes.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  const avatar = normalizeEmployeeAvatar(args.avatar);

  const authenticatedEmployeeId = context.authUser?._id;
  if (!authenticatedEmployeeId) {
    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  const employee = await context.models.Employees.findById(
    authenticatedEmployeeId,
  ).select("+password");
  if (!employee) {
    throw new GraphQLError("Employee profile not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  if (args.firstName != null) employee.firstName = args.firstName.trim();
  if (args.lastName != null) employee.lastName = args.lastName.trim();
  if (args.phone != null) employee.phone = args.phone.trim();
  if (args.password) employee.password = args.password;
  if (avatar !== undefined) employee.avatar = avatar;
  if (args.firstName != null || args.lastName != null) {
    employee.name = `${employee.lastName ?? ""} ${employee.firstName ?? ""}`.trim();
  }

  await employee.save();
  return employee;
};

const resolvers = {
  DateTime: GraphQLDateTime,

  Query: {
    ...patientQueries,
    ...appointmentQueries,
    employees: async (
      _parent: unknown,
      args: { role?: "ADMIN" | "RECEPTION" | "DOCTOR" },
      context: IContext,
    ) => {
      requireRoles(context.authUser, "ADMIN", "RECEPTION", "DOCTOR");
      const role = context.authUser?.role === "ADMIN" ? args.role : "DOCTOR";
      return context.models.Employees.find(role ? { role } : {})
        .select(
          "_id name firstName lastName age gender avatar phone registerNumber username role",
        )
        .sort({ name: 1 })
        .lean();
    },
    me: async (
      _parent: unknown,
      _args: unknown,
      context: IContext,
    ) => {
      requireRoles(context.authUser, "ADMIN", "RECEPTION", "DOCTOR");
      const authenticatedEmployeeId = context.authUser?._id;
      if (!authenticatedEmployeeId) {
        throw new GraphQLError("Authentication required.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      const employee = await context.models.Employees.findById(
        authenticatedEmployeeId,
      );
      if (!employee) {
        throw new GraphQLError("Employee profile not found.", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return employee;
    },
  },

  Mutation: {
    ...patientMutations,
    ...appointmentMutations,
    createEmployee,
    employeeAdd: createEmployee,
    updateEmployee,
    deleteEmployee,
    updateMyProfile,
    employeeProfileUpdate: updateMyProfile,
  },

  Employee: {
    firstName: (parent: { firstName?: string; name?: string }) =>
      parent.firstName?.trim() || parent.name || "",
    lastName: (parent: { lastName?: string }) => parent.lastName?.trim() || "",
  },

  Patient: {
    appointments: async (
      parent: { _id?: string | mongoose.Types.ObjectId; id?: string },
      _args: unknown,
      context: IContext,
    ) => {
      const patientId = parent._id || parent.id;
      if (!patientId) return [];

      const patientObjectId = new mongoose.Types.ObjectId(
        patientId.toString(),
      );
      return context.models.Appointments.find({
        patientId: { $in: [patientId.toString(), patientObjectId] },
        ...(context.authUser?.role === "DOCTOR"
          ? { doctorId: context.authUser._id }
          : {}),
      });
    },
  },
};

export const apolloServer = new ApolloServer<IContext>({
  typeDefs,
  resolvers,
  introspection: true,
});
