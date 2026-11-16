export type EmployeeRole = "ADMIN" | "RECEPTION" | "DOCTOR";

export interface EmployeeRecord {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  registerNumber: string;
  avatar?: string | null;
  role: EmployeeRole;
}

export interface CreateEmployeeVariables {
  firstName: string;
  lastName: string;
  phone: string;
  registerNumber: string;
  username: string;
  password: string;
  role: Exclude<EmployeeRole, "ADMIN">;
}

export interface UpdateEmployeeVariables {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  username: string;
  registerNumber: string;
  avatar: string | null;
  role: Exclude<EmployeeRole, "ADMIN">;
}
