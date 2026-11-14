export interface Appointment {
  _id: string;
  startTime: string;      // Бэкенд scalar DateTime -> Фронтенд string (ISO string)
  endTime: string;        // Бэкенд scalar DateTime -> Фронтенд string
  doctorName: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  diagnosis?: string;     // Бэкенд дээрх нэршил нь 'diagnosis' байгаа (reason биш)
  examinationNotes?: string;
  symptoms?: string;
  treatment?: string;
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

export interface PatientsQueryVariables {
  page?: number;
  perPage?: number;
  search?: string | null;
}

export interface AppointmentSearchResult extends Appointment {
  patientName: string;
  registrationNumber: string;
}

export interface AppointmentsQuery {
  appointments: {
    list: AppointmentSearchResult[];
    pageInfo: PageInfo;
    totalCount?: number;
  };
}

export interface AppointmentsQueryVariables {
  page?: number;
  perPage?: number;
  search?: string | null;
  status?: Appointment["status"];
}