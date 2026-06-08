import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { IContext } from "../../../connectionResolver";

export const appointmentMutations = {
  appointmentAdd: async (
    _parent: any,
    { patientId, startTime, endTime, doctorName, status, diagnosis }: any,
    context: IContext,
  ) => {
    // 1. Ирсэн ID нь Монгусын зөв ObjectId мөн эсэхийг шалгах
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      throw new GraphQLError("Ирүүлсэн өвчтөний ID-ийн формат буруу байна.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    // 2. Огноог шалгах
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

    // 3. Цагийн дараалал зөв үү?
    if (start >= end) {
      throw new GraphQLError(
        "Уулзалтын эхлэх цаг дуусах цагаас өмнө байх ёстой!",
        {
          extensions: { code: "BAD_USER_INPUT" },
        },
      );
    }

    try {
      // 4. Энэ өвчтөн бааз дээр үнэхээр байна уу?
      const patientExists = await context.models.Patients.findById(patientId);
      if (!patientExists) {
        throw new GraphQLError(
          "Уулзалт товлох гэж буй өвчтөн системд бүртгэгдээгүй байна.",
          {
            extensions: { code: "NOT_FOUND" },
          },
        );
      }

      // 5. Уулзалтыг үүсгэнэ
      const newAppointment = await context.models.Appointments.create({
        patientId,
        startTime,
        endTime,
        doctorName,
        status: "SCHEDULED",
        diagnosis,
      });

      // 6. Өвчтөний 'appointments' массивд шинэ уулзалтын ID-г нэмнэ
      await context.models.Patients.findByIdAndUpdate(patientId, {
        $push: { appointments: newAppointment._id },
      });

      return newAppointment;
    } catch (error: any) {
      if (error instanceof GraphQLError) throw error;

      console.error("Appointment үүсгэхэд алдаа гарлаа:", error);
      throw new GraphQLError("Уулзалт хадгалахад дотоод алдаа гарлаа.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  },

  // 🔥 Үзлэг дуусгаж, онош хадгалах шинэ мутаци
  appointmentComplete: async (
    _parent: any,
    { appointmentId, diagnosis }: { appointmentId: string; diagnosis: string },
    context: IContext,
  ) => {
    // 1. Ирсэн ID нь Монгусын зөв ObjectId мөн үү?
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new GraphQLError("Ирүүлсэн уулзалтын ID-ийн формат буруу байна.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    try {
      // 2. Уулзалтыг олоод, статус болон оношийг нь шинэчлэх
      const updatedAppointment =
        await context.models.Appointments.findByIdAndUpdate(
          appointmentId,
          {
            $set: {
              status: "COMPLETED", // Төлвийг "Үзсэн" болгоно
              diagnosis: diagnosis, // Оношийг хадгална
            },
          },
          { new: true }, // Шинэчлэгдсэн датаг буцааж авах тохиргоо
        );

      if (!updatedAppointment) {
        throw new GraphQLError("Ийм ID-тай уулзалт олдсонгүй.", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return updatedAppointment;
    } catch (error: any) {
      if (error instanceof GraphQLError) throw error;

      console.error("Үзлэг дуусгахад алдаа гарлаа:", error);
      throw new GraphQLError("Үзлэг хадгалахад дотоод алдаа гарлаа.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  },
  appointmentCancel: async (
    _parent: any,
    { appointmentId }: { appointmentId: string },
    context: IContext,
  ) => {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new GraphQLError("Ирүүлсэн уулзалтын ID-ийн формат буруу байна.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    try {
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
    } catch (error: any) {
      if (error instanceof GraphQLError) throw error;

      console.error("Уулзалт цуцлахад алдаа гарлаа:", error);
      throw new GraphQLError("Уулзалт цуцлахад дотоод алдаа гарлаа.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  },
};
