export type EmployeeProfile = {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: "MALE" | "FEMALE";
  avatar?: string | null;
  phone: string;
  registerNumber: string;
  username: string;
  role: "ADMIN" | "RECEPTION" | "DOCTOR";
};

export type ProfileFormValues = Pick<
  EmployeeProfile,
  "firstName" | "lastName" | "phone"
> & {
  password: string;
  avatar: string;
};
