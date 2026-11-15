import { IconShield, IconUsers, IconSmartHome } from "@tabler/icons-react";

export const GET_MODULES = (userRole?: string) => {
  const modules = [
    { path: "/home/pending", icon: IconSmartHome, label: "Үндсэн цэс" },
  ];

  if (userRole === "ADMIN" || userRole === "RECEPTION" || userRole === "DOCTOR") {
    modules.push({ path: "/patients", icon: IconUsers, label: "Үйлчлүүлэгчид" });
    modules.push({ path: "/profile", icon: IconUsers, label: "Ажилтны мэдээлэл" });
  }

  if (userRole === "ADMIN") {
    modules.push({ path: "/admin", icon: IconShield, label: "Admin Panel" });
  }

  return modules;
};