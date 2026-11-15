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

type UpdateMyProfileArgs = {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  password?: string | null;
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
          "_id name firstName lastName age gender phone registerNumber username role",
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
