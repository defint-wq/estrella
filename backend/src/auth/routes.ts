import { Router } from "express";
import bcrypt from "bcryptjs";
import { getModels } from "../../connectionResolver.js";
import {
  clearSessionCookie,
  createSession,
  requireAuthentication,
  revokeSession,
  toAuthUser,
  type AuthenticatedRequest,
} from "./session.js";

export const authRouter = Router();

authRouter.use((_request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});

authRouter.post("/login", async (request, response) => {
  const { username, password } = request.body ?? {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    response.status(400).json({ error: "Username and password are required." });
    return;
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    response.status(401).json({ error: "Invalid username or password." });
    return;
  }

  const employee = await getModels()
    .Employees.findOne({ username: username.trim().toLowerCase() })
    .select("+password");
  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    response.status(401).json({ error: "Invalid username or password." });
    return;
  }

  await createSession(employee._id.toString(), response);
  response.json({ user: toAuthUser(employee) });
});

authRouter.get(
  "/me",
  requireAuthentication,
  (request: AuthenticatedRequest, response) => {
    response.json({ user: request.authUser });
  },
);

authRouter.post("/logout", async (request, response) => {
  await revokeSession(request);
  clearSessionCookie(response);
  response.status(204).end();
});
