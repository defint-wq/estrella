import mongoose, { Model } from "mongoose";
import type {
  IAppointment,
  IAppointmentDocument,
} from "../../../@types/Appointment.js";
import type { IModels } from "../../../connectionResolver.js";
import { appointmentSchema } from "../definition/appointment.js";

export interface IAppointmentModel extends Model<IAppointmentDocument> {
  createAppointment(doc: IAppointment): Promise<IAppointmentDocument>;
  updateAppointment(
    _id: string,
    doc: Partial<IAppointment>,
  ): Promise<IAppointmentDocument | null>;
  removeAppointment(_id: string): Promise<string>;
}

export const loadAppointmentClass = (model: IModels) => {
  class Appointment {
    // 1. Уулзалт үүсгэх ба өвчтөний түүх рүү холбох
    public static async createAppointment(doc: IAppointment) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const appointment = await model.Appointments.create([doc], { session });

        await model.Patients.findByIdAndUpdate(
          doc.patientId,
          {
            $push: { appointments: appointment[0]._id },
          },
          { session },
        );

        await session.commitTransaction();
        return appointment[0];
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    // 2. Уулзалт засах
    public static async updateAppointment(
      _id: string,
      doc: Partial<IAppointment>,
    ) {
      return await model.Appointments.findByIdAndUpdate(
        _id,
        { $set: doc },
        { returnDocument: "after" },
      );
    }

    // 3. Уулзалт устгах ба өвчтөний түүхээс хасах
    public static async removeAppointment(_id: string) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const appointment =
          await model.Appointments.findById(_id).session(session);
        if (!appointment) throw new Error("Appointment not found");

        await model.Patients.findByIdAndUpdate(
          appointment.patientId,
          {
            $pull: { appointments: _id },
          },
          { session },
        );

        await model.Appointments.deleteOne({ _id }, { session });

        await session.commitTransaction();
        return "Deleted successfully!!!";
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  }

  appointmentSchema.loadClass(Appointment);
  return mongoose.model<IAppointmentDocument, IAppointmentModel>(
    "Appointments",
    appointmentSchema,
  );
};
