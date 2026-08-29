import express from "express";
import cors from "cors";
import { apolloServer } from "./src/apolloIndex.js";
import { connect, getContext } from "./connectionResolver.js";
import { expressMiddleware } from "@as-integrations/express5";

const app = express();
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. MongoDB-тэй холбогдох
    await connect();

    // 2. Apollo Server-ийг эхлүүлэх
    await apolloServer.start();

    // 3. GraphQL Middleware
    app.use(
      "/graphql",
      cors<cors.CorsRequest>(),
      express.json(),
      expressMiddleware(apolloServer, {
        context: async () => getContext(),
      })
    );

    // 4. Порт дээр асаах
    app.listen(PORT, () => {
      console.log(`🚀 Сервер аслаа: http://localhost:${PORT}/graphql`);
    });

  } catch (error) {
    console.error("Сервер асаахад алдаа гарлаа:", error);
    process.exit(1);
  }
};

// Серверийг ажиллуулах
startServer();