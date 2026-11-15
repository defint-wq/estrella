import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { IContext } from "../../../connectionResolver.js"; // 👈 .js өргөтгөл нэмэв
import { requireRoles } from "../../auth/session.js";

interface AppointmentAddArgs {
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  diagnosis?: string;
}

export const appointmentMutations = {
  appointmentAdd: async (
    _parent: unknown,
    { patientId, doctorId, startTime, endTime, diagnosis }: AppointmentAddArgs,
    context: IContext,
  ) => {
    requireRoles(context.authUser, "ADMIN", "RECEPTION");
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      throw new GraphQLError("Ирүүлсэн өвчтөний ID-ийн формат буруу байна.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new GraphQLError("Эмчийн ID буруу байна.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const today = new Date();

    if (start < today || end < today) {
      throw new GraphQLError(
        "Уулзалтын огноо өнгөрсөн цаг хугацаа байж болохгүй!",
        {
          extensions: { code: "BAD_USER_INPUT" },
        },
      );
    }

    if (start >= end) {
      throw new GraphQLError(
        "Уулзалтын эхлэх цаг дуусах цагаас өмнө байх ёстой!",
        {
          extensions: { code: "BAD_USER_INPUT" },
        },
      );
    }

    try {
      const patientExists = await context.models.Patients.findById(patientId);
      if (!patientExists) {
        throw new GraphQLError(
          "Уулзалт товлох гэж буй өвчтөн системд бүртгэгдээгүй байна.",
          {
            extensions: { code: "NOT_FOUND" },
          },
        );
      }
      const doctor = await context.models.Employees.findOne({
        _id: doctorId,
        role: "DOCTOR",
      });
      if (!doctor) {
        throw new GraphQLError("Сонгосон эмч олдсонгүй.", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const newAppointment = await context.models.Appointments.create({
        patientId,
        doctorId,
        startTime,
        endTime,
        status: "SCHEDULED",
        doctorName: doctor.name,
        diagnosis,
      });

      await context.models.Patients.findByIdAndUpdate(patientId, {
        $push: { appointments: newAppointment._id },
      });

      return newAppointment;
    } catch (error: unknown) {
      if (error instanceof GraphQLError) throw error;

      console.error("Appointment үүсгэхэд алдаа гарлаа:", error);
      throw new GraphQLError("Уулзалт хадгалахад дотоод алдаа гарлаа.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  },

  appointmentComplete: async (
    _parent: unknown,
    {
      appointmentId,
      diagnosis,
      examinationNotes,
      symptoms,
      treatment,
    }: {
      appointmentId: string;
      diagnosis: string;
      examinationNotes?: string;
      symptoms?: string;
      treatment?: string;
    },
    context: IContext,
  ) => {
    requireRoles(context.authUser, "ADMIN", "DOCTOR");
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new GraphQLError("Ирүүлсэн уулзалтын ID-ийн формат буруу байна.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    try {
      const currentAppointment = await context.models.Appointments.findById(
        appointmentId,
      );
      if (
        context.authUser?.role === "DOCTOR" &&
        currentAppointment?.doctorId.toString() !== context.authUser._id
      ) {
        throw new GraphQLError("You are not authorized to perform this action.", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      const updates: {
        status: string;
        diagnosis: string;
        examinationNotes?: string;
        symptoms?: string;
        treatment?: string;
      } = {
        status: "COMPLETED",
        diagnosis: diagnosis.trim(),
      };
      if (examinationNotes !== undefined) updates.examinationNotes = examinationNotes.trim();
      if (symptoms !== undefined) updates.symptoms = symptoms.trim();
      if (treatment !== undefined) updates.treatment = treatment.trim();

      const updatedAppointment = await context.models.Appointments.findByIdAndUpdate(
        appointmentId,
        { $set: updates },
        { new: true },
      );

      if (!updatedAppointment) {
        throw new GraphQLError("Ийм ID-тай уулзалт олдсонгүй.", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return updatedAppointment;
    } catch (error: unknown) {
      if (error instanceof GraphQLError) throw error;

      console.error("Үзлэг дуусгахад алдаа гарлаа:", error);
      throw new GraphQLError("Үзлэг хадгалахад дотоод алдаа гарлаа.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  },

  appointmentCancel: async (
    _parent: unknown,
    { appointmentId }: { appointmentId: string },
    context: IContext,
  ) => {
    requireRoles(context.authUser, "ADMIN", "RECEPTION", "DOCTOR");
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new GraphQLError("Ирүүлсэн уулзалтын ID-ийн формат буруу байна.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    try {
      const currentAppointment = await context.models.Appointments.findById(
        appointmentId,
      );
      if (
        context.authUser?.role === "DOCTOR" &&
        currentAppointment?.doctorId.toString() !== context.authUser._id
      ) {
        throw new GraphQLError("You are not authorized to perform this action.", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      const updatedAppointment =
        await context.models.Appointments.findByIdAndUpdate(
          appointmentId,
          { $set: { status: "CANCELLED" } },
          { new: true },
        );

      if (!updatedAppointment) {
        throw new GraphQLError("Ийм ID-тай уулзалт олдсонгүй.", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return updatedAppointment;
    } catch (error: unknown) {
      if (error instanceof GraphQLError) throw error;

      console.error("Уулзалт цуцлахад алдаа гарлаа:", error);
      throw new GraphQLError("Уулзалт цуцлахад дотоод алдаа гарлаа.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  },
};