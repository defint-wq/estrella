import { IContext } from "../../../connectionResolver.js";
import { createPatientSearchFilter } from "../../utils/search.js";

export const patientQueries = {
  patients: async (
    _root: any,
    args: { page?: number; perPage?: number; search?: string },
    context: IContext,
  ) => {
    try {
      const { models } = context;
      const page = args.page || 1;
      const perPage = args.perPage || 10;
      const skip = (page - 1) * perPage;
      const filter = createPatientSearchFilter(args.search);

      const [totalCount, list] = await Promise.all([
        models.Patients.countDocuments(filter),
        models.Patients.getPatients(skip, perPage, args.search),
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
    } catch (error: any) {
      throw new Error(`Өвчтөний жагсаалт авахад алдаа гарлаа: ${error.message}`);
    }
  },
};