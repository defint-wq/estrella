import { IContext } from "../../../connectionResolver";

export const patientQueries = {
  patients: async (
    _root: any,
    args: { page?: number; perPage?: number },
    context: IContext
  ) => {
    try {
      const { models } = context;
      const page = args.page || 1;
      const perPage = args.perPage || 10;
      const skip = (page - 1) * perPage;

      // 1. Нийт тоог стандарт Mongoose countDocuments-оор авна
      const totalCount = await models.Patients.countDocuments();

      // 2. Таны модель дээр үүсгэсэн getPatients() функцийг дуудна
      const list = await models.Patients.getPatients(skip, perPage);

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