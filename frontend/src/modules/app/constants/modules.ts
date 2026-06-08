import { IconHome, IconStethoscope, IconShield, IconUsers, IconSmartHome } from "@tabler/icons-react"; // Таны ашиглаж буй icon-ууд

export const GET_MODULES = (userRole?: string) => {
  const modules = [
    { path: "/", icon: IconSmartHome, label: "Үндсэн цэс" },
    { path: "/patients", icon: IconUsers, label: "Үйлчлүүлэгчид" },
    { path: "/profile", icon: IconStethoscope, label: "Эмчийн мэдээлэл" },
  ];

  if (userRole === "admin") {
    modules.push({ path: "/admin", icon: IconShield, label: "Admin Panel" });
  }

  return modules;
};