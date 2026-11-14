export type DoctorProfile = {
  name: string;
  specialty: string;
  room: string;
  workingHours: string;
  bio: string;
  scheduleStatus: string;
  schedule: { day: string; hours: string }[];
};

export const doctorProfileMock: DoctorProfile = {
  name: "Др. Мөнхцэцэг",
  specialty: "Дотрын эмч",
  room: "208 тоот",
  workingHours: "Даваа–Баасан, 09:00–17:00",
  bio: "Өвчтөн бүрт анхаарал халамжтай, нотолгоонд суурилсан тусламж үйлчилгээ үзүүлэхийг эрхэмлэдэг.",
  scheduleStatus: "Өнөөдөр үзлэгтэй",
  schedule: [
    { day: "Даваа", hours: "09:00–17:00" },
    { day: "Мягмар", hours: "09:00–17:00" },
    { day: "Лхагва", hours: "09:00–17:00" },
    { day: "Пүрэв", hours: "09:00–17:00" },
    { day: "Баасан", hours: "09:00–16:00" },
    { day: "Бямба, Ням", hours: "Амралтын өдөр" },
  ],
};
