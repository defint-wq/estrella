import mongoose, { Model } from "mongoose";
import type { Types } from "mongoose";
import type { IPatient, IPatientDocument } from "../../../@types/Patient.js";
import type { IModels } from "../../../connectionResolver.js";
import { patientSchema } from "../definition/patients.js";
import { createPatientSearchFilter } from "../../utils/search.js";

export interface IPatientModel extends Model<IPatientDocument> {
  getPatients(
    skip: number,
    limit: number,
    search?: string,
    patientIds?: (Types.ObjectId | string)[],
  ): Promise<IPatientDocument[]>;
  createPatient(doc: IPatient): Promise<IPatientDocument>;
  updatePatient(
    _id: string,
    doc: Partial<IPatient>,
  ): Promise<IPatientDocument | null>;
  removePatients(ids: string[]): Promise<string>;
}

export const loadPatientClass = (model: IModels) => {
  class Patient {
    // 1. Өвчтөнүүдийг хуудаслалт болон уулзалтуудтай нь хамт татах
    public static async getPatients(
      skip: number,
      limit: number,
      search?: string,
      patientIds?: (Types.ObjectId | string)[],
    ) {
      // mongoose.model-оор шууд дуудах нь Circular Dependency-ээс сэргийлнэ
      const PatientModel = mongoose.model<IPatientDocument, IPatientModel>(
        "Patients",
      );

      const searchFilter = createPatientSearchFilter(search);
      const filter = patientIds
        ? { ...searchFilter, _id: { $in: patientIds } }
        : searchFilter;

      return await PatientModel.find(filter)
        .populate({
          path: "appointments",
          options: { sort: { startTime: -1 } },
        })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    // 2. Шинэ өвчтөн бүртгэх
    public static async createPatient(doc: IPatient) {
      return await model.Patients.create(doc);
    }

    // 3. Өвчтөний мэдээлэл засах
    public static async updatePatient(_id: string, doc: Partial<IPatient>) {
      return await model.Patients.findByIdAndUpdate(
        _id,
        { $set: doc },
        { new: true, runValidators: true },
      );
    }

    // 4. Өвчтөн болон холбогдох уулзалтуудыг Transaction ашиглан устгах
    public static async removePatients(ids: string[]) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await model.Appointments.deleteMany(
          { patientId: { $in: ids } },
          { session },
        );
        await model.Patients.deleteMany({ _id: { $in: ids } }, { session });

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

  patientSchema.loadClass(Patient);
  return mongoose.model<IPatientDocument, IPatientModel>(
    "Patients",
    patientSchema,
  );
};
