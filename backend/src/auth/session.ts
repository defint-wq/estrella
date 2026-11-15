import { createHash, randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { GraphQLError } from "graphql";
import type { IAuthUser, EmployeeRole } from "../../@types/Employee.js";
import { getModels } from "../../connectionResolver.js";

export const AUTH_COOKIE = "__Host-estrella_session";
export const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_MS,
};

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const getCookieToken = (request: Request) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE}=`));

  if (!cookie) return null;
  try {
    return decodeURIComponent(cookie.slice(AUTH_COOKIE.length + 1));
  } catch {
    return null;
  }
};

export const toAuthUser = (employee: {
  _id: { toString(): string };
  username: string;
  name: string;
  role: EmployeeRole;
}): IAuthUser => ({
  _id: employee._id.toString(),
  username: employee.username,
  name: employee.name,
  role: employee.role,
});

export const createSession = async (
  employeeId: string,
  response: Response,
) => {
  const token = randomBytes(32).toString("base64url");
  await getModels().AuthSessions.create({
    tokenHash: hashToken(token),
    employeeId,
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
  });
  response.cookie(AUTH_COOKIE, token, cookieOptions);
};

export const clearSessionCookie = (response: Response) => {
  response.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
};

export const revokeSession = async (request: Request) => {
  const token = getCookieToken(request);
  if (!token) return;

  await getModels().AuthSessions.deleteOne({ tokenHash: hashToken(token) });
};

export interface AuthenticatedRequest extends Request {
  authUser?: IAuthUser;
}

export const requireAuthentication = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
  const token = getCookieToken(request);
  if (!token) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  const session = await getModels()
    .AuthSessions.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    })
    .lean();
  if (!session) {
    clearSessionCookie(response);
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  const employee = await getModels().Employees.findById(session.employeeId)
    .select("_id username name role")
    .lean();
  if (!employee) {
    await getModels().AuthSessions.deleteOne({ _id: session._id });
    clearSessionCookie(response);
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  request.authUser = toAuthUser(employee);
  next();
};

export const requireRoles = (
  user: IAuthUser | undefined,
  ...allowedRoles: EmployeeRole[]
) => {
  if (!user) {
    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  if (!allowedRoles.includes(user.role)) {
    throw new GraphQLError("You are not authorized to perform this action.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};
