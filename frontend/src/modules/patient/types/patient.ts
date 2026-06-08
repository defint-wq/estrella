export interface Appointment {
  _id: string;
  startTime: string;      // Бэкенд scalar DateTime -> Фронтенд string (ISO string)
  endTime: string;        // Бэкенд scalar DateTime -> Фронтенд string
  doctorName: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  diagnosis?: string;     // Бэкенд дээрх нэршил нь 'diagnosis' байгаа (reason биш)
}

export interface Patient {
  _id: string;
  registrationNumber: string; // Схемд байгаа заавал байх ёстой талбар
  firstName: string;
  lastName: string;
  age: number;
  sex?: "MALE" | "FEMALE";    // Бэкенд дээрх Enum 'SexStatus'
  appointments: Appointment[];
}

export interface PageInfo {
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PatientsQuery {
  patients: {
    list: Patient[];
    pageInfo: PageInfo;
    totalCount?: number;
  };
}