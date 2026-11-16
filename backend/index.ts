import express from "express";
import cors from "cors";
import { apolloServer } from "./src/apolloIndex.js";
import { connect, getContext } from "./connectionResolver.js";
import { expressMiddleware } from "@as-integrations/express5";
import { authRouter } from "./src/auth/routes.js";
import {
  requireAuthentication,
  type AuthenticatedRequest,
} from "./src/auth/session.js";
import { seedInitialAdmin } from "./src/config/adminSeed.js";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigin =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const corsOptions: cors.CorsOptions = {
  origin: allowedOrigin,
  credentials: true,
};

const startServer = async () => {
  try {
    await connect();
    await seedInitialAdmin(getContext().models);

    await apolloServer.start();

    app.use(cors(corsOptions));
    app.use(express.json({ limit: "3mb" }));
    app.use("/auth", authRouter);
    app.use(
      "/graphql",
      (_request, response, next) => {
        response.setHeader("Cache-Control", "no-store");
        next();
      },
      requireAuthentication,
      expressMiddleware(apolloServer, {
        context: async ({ req }) =>
          getContext((req as AuthenticatedRequest).authUser),
      }),
    );

    app.listen(PORT, () => {
      console.log(`🚀 Сервер аслаа: http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Сервер асаахад алдаа гарлаа:", error);
    process.exit(1);
  }
};

startServer();