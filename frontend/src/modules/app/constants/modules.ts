import { CircleUserRound, House, Shield, Users } from "lucide-react";

export const GET_MODULES = (userRole?: string) => {
  const modules = [
    { path: "/home/pending", icon: House, label: "Үндсэн цэс" },
  ];

  if (userRole === "ADMIN" || userRole === "RECEPTION" || userRole === "DOCTOR") {
    modules.push({ path: "/patients", icon: Users, label: "Үйлчлүүлэгчид" });
    modules.push({ path: "/profile", icon: CircleUserRound, label: "Ажилтны мэдээлэл" });
  }

  if (userRole === "ADMIN") {
    modules.push({ path: "/admin", icon: Shield, label: "Admin Panel" });
  }

  return modules;
};