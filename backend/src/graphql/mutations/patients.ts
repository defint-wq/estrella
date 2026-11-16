import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { IContext } from "../../../connectionResolver.js";
import { requireRoles } from "../../auth/session.js";

interface PatientAddArgs {
  registrationNumber: string;
  firstName: string;
  lastName: string;
  age: number;
  sex?: "MALE" | "FEMALE";
}

export const patientMutations = {
  patientAdd: async (
    _parent: unknown,
    args: PatientAddArgs,
    context: IContext,
  ) => {
    requireRoles(context.authUser, "ADMIN", "RECEPTION");
    const { registrationNumber, firstName, lastName, age, sex } = args;

    if (age <= 0 || age > 130) {
      throw new GraphQLError('Нас 1-ээс 130-ийн хооронд байх ёстой!', {
        extensions: { code: 'BAD_USER_INPUT', argumentName: 'age' }
      });
    }

    if (!firstName.trim() || !lastName.trim() || !registrationNumber.trim()) {
      throw new GraphQLError('Регистрийн дугаар, нэр, овгийг заавал бөглөнө үү.', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    // 2. Давхардсан РД шалгах
    const existingPatient = await context.models.Patients.findOne({ registrationNumber });
    if (existingPatient) {
      throw new GraphQLError('Энэ регистрийн дугаартай өвчтөн аль хэдийн бүртгэгдсэн байна!', {
        extensions: { code: 'BAD_USER_INPUT', argumentName: 'registrationNumber' }
      });
    }

    try {
      const newPatient = await context.models.Patients.create({
        registrationNumber,
        firstName,
        lastName,
        age,
        sex,
      });
      return newPatient;
    } catch (error) {
      console.error("Patient үүсгэхэд алдаа гарлаа:", error);
      throw new GraphQLError('Баазтай холбогдоход алдаа гарлаа.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  patientEdit: async (
    _parent: unknown,
    args: PatientAddArgs & { _id: string },
    context: IContext,
  ) => {
    requireRoles(context.authUser, "ADMIN", "RECEPTION");
    if (!mongoose.Types.ObjectId.isValid(args._id)) {
      throw new GraphQLError("Invalid patient ID.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    const registrationNumber = args.registrationNumber.trim().toUpperCase();
    const firstName = args.firstName.trim();
    const lastName = args.lastName.trim();
    if (
      !registrationNumber ||
      !firstName ||
      !lastName ||
      !Number.isInteger(args.age) ||
      args.age < 1 ||
      args.age > 130 ||
      (args.sex !== undefined &&
        args.sex !== "MALE" &&
        args.sex !== "FEMALE")
    ) {
      throw new GraphQLError("Invalid patient details.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    const patient = await context.models.Patients.findById(args._id);
    if (!patient) {
      throw new GraphQLError("Patient not found.", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    const duplicate = await context.models.Patients.findOne({
      registrationNumber,
      _id: { $ne: patient._id },
    });
    if (duplicate) {
      throw new GraphQLError(
        "A patient with this registration number already exists.",
        { extensions: { code: "BAD_USER_INPUT" } },
      );
    }

    patient.registrationNumber = registrationNumber;
    patient.firstName = firstName;
    patient.lastName = lastName;
    patient.age = args.age;
    if (args.sex) patient.sex = args.sex;
    return patient.save();
  },

  patientRemove: async (
    _parent: unknown,
    args: { ids: string[] },
    context: IContext,
  ) => {
    requireRoles(context.authUser, "ADMIN", "RECEPTION");
    if (
      args.ids.length === 0 ||
      args.ids.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      throw new GraphQLError("At least one valid patient ID is required.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    return context.models.Patients.removePatients(args.ids);
  },
};