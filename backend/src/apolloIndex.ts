import { ApolloServer } from "@apollo/server";
import { GraphQLDateTime } from "graphql-scalars";
// 👇 Доорх import-уудын төгсгөлд .js өргөтгөл нэмэв:
import { mutations, queries, types } from "./graphql/schemas/patients.js";
import { IContext } from "../connectionResolver.js";
import { patientQueries } from "./graphql/queries/patients.js";
import { patientMutations } from "./graphql/mutations/patients.js";
import { appointmentMutations } from "./graphql/mutations/appointments.js";
import mongoose from "mongoose";

const typeDefs = `
  scalar DateTime
  ${types()}
  type Query { ${queries} }
  type Mutation { ${mutations} }
`;

const resolvers = {
  DateTime: GraphQLDateTime,

  Query: {
    ...patientQueries,
  },

  Mutation: {
    ...patientMutations,
    ...appointmentMutations,
  },

  Patient: {
    appointments: async (parent: any, _args: any, context: IContext) => {
      try {
        const pId = parent._id || parent.id;
        if (!pId) return [];

        const idStr = pId.toString();
        const mongooseObjectId = new mongoose.Types.ObjectId(idStr);

        return await context.models.Appointments.find({
          patientId: { $in: [idStr, mongooseObjectId] },
        });
      } catch (error) {
        console.error("Уулзалтуудыг холбоход алдаа гарлаа:", error);
        return [];
      }
    },
  },
};

export const apolloServer = new ApolloServer<IContext>({
  typeDefs: typeDefs,
  resolvers,
  introspection: true,
});