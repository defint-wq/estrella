import { IContext } from "../../../connectionResolver.js";
import { createPatientSearchFilter } from "../../utils/search.js";
import { requireRoles } from "../../auth/session.js";

export const patientQueries = {
  patients: async (
    _root: unknown,
    args: { page?: number; perPage?: number; search?: string },
    context: IContext,
  ) => {
    requireRoles(context.authUser, "ADMIN", "RECEPTION", "DOCTOR");
    try {
      const { models } = context;
      const page = args.page || 1;
      const perPage = args.perPage || 10;
      const skip = (page - 1) * perPage;
      const patientIds =
        context.authUser?.role === "DOCTOR"
          ? await models.Appointments.distinct("patientId", {
              doctorId: context.authUser._id,
            })
          : undefined;
      const filter = {
        ...createPatientSearchFilter(args.search),
        ...(patientIds ? { _id: { $in: patientIds } } : {}),
      };

      const [totalCount, list] = await Promise.all([
        models.Patients.countDocuments(filter),
        models.Patients.getPatients(skip, perPage, args.search, patientIds),
      ]);

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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown database error.";
      throw new Error(`Өвчтөний жагсаалт авахад алдаа гарлаа: ${message}`, {
        cause: error,
      });
    }
  },
};