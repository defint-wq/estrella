import express from "express";
import cors from "cors";
import { apolloServer } from "./src/apolloIndex";
import { connect, getContext } from "./connectionResolver";
import { expressMiddleware } from "@as-integrations/express5";

const app = express();
const PORT = process.env.PORT;

async function startServer() {
  try {
    // 1. MongoDB өгөгдлийн сантай холбогдох (initModels давхар ажиллана)
    await connect();

    // 2. Apollo Server-ийг эхлүүлэх
    await apolloServer.start();

    // 3. GraphQL Middleware-ийг Express дээр бүртгэх
    app.use(
      "/graphql",
      cors<cors.CorsRequest>(),
      express.json(),
      expressMiddleware(apolloServer, {
        context: async () => getContext(), // Таны бэлдсэн getContext функц
      })
    );

    // 4. Серверийг портон дээр асааж, идэвхтэй байлгах
    app.listen(PORT, () => {
      console.log(`🚀 Сервер аслаа: http://localhost:${PORT}/graphql`);
    });

  } catch (error) {
    console.error("Сервер асаахад алдаа гарлаа:", error);
    process.exit(1);
  }
}

// Серверийг ажиллуулах
startServer();