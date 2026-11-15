import type { IContext } from "../../../connectionResolver.js";
import {
  createPatientSearchFilter,
  createSearchRegex,
} from "../../utils/search.js";
import { requireRoles } from "../../auth/session.js";

interface AppointmentSearchArgs {
  page?: number;
  perPage?: number;
  search?: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export const appointmentQueries = {
  appointments: async (
    _root: unknown,
    args: AppointmentSearchArgs,
    context: IContext,
  ) => {
    requireRoles(context.authUser, "ADMIN", "RECEPTION", "DOCTOR");
    const page = Math.max(args.page ?? 1, 1);
    const perPage = Math.max(args.perPage ?? 10, 1);
    const searchRegex = createSearchRegex(args.search);

    try {
      const matchingPatients = searchRegex
        ? await context.models.Patients.find(
          createPatientSearchFilter(args.search),
        )
          .select("_id")
          .lean()
        : [];
      const matchingPatientIds = matchingPatients.map((patient) => patient._id);
      const searchFilter = searchRegex
        ? {
            $or: [
              { doctorName: searchRegex },
              { diagnosis: searchRegex },
              { examinationNotes: searchRegex },
              { symptoms: searchRegex },
              { treatment: searchRegex },
              { patientId: { $in: matchingPatientIds } },
            ],
          }
        : {};

      const conditions: Record<string, unknown>[] = [searchFilter];
      if (args.status) conditions.push({ status: args.status });
      if (context.authUser?.role === "DOCTOR") {
        conditions.push({ doctorId: context.authUser._id });
      }
      const filter = { $and: conditions };

      const [totalCount, appointments] = await Promise.all([
        context.models.Appointments.countDocuments(filter),
        context.models.Appointments.find(filter)
          .sort({ startTime: args.status === "COMPLETED" ? -1 : 1 })
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
      ]);

      const patientIds = appointments.map((appointment) => appointment.patientId);
      const patients = await context.models.Patients.find({
        _id: { $in: patientIds },
      })
        .select("firstName lastName registrationNumber")
        .lean();
      const patientsById = new Map(
        patients.map((patient) => [patient._id.toString(), patient]),
      );

      const list = appointments.flatMap((appointment) => {
        const patient = patientsById.get(appointment.patientId.toString());
        if (!patient) return [];

        return [{
          ...appointment,
          patientName: `${patient.lastName} ${patient.firstName}`.trim(),
          registrationNumber: patient.registrationNumber,
        }];
      });
      const totalPages = Math.ceil(totalCount / perPage);

      return {
        list,
        pageInfo: {
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        totalCount,
      };
    } catch (error) {
      throw new Error(
        `Үзлэгийн жагсаалт авахад алдаа гарлаа: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  },
};