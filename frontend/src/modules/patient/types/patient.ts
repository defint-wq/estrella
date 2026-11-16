export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  _id: string;
  doctorId?: string;
  startTime: string;      // Бэкенд scalar DateTime -> Фронтенд string (ISO string)
  endTime: string;        // Бэкенд scalar DateTime -> Фронтенд string
  doctorName: string;
  status: AppointmentStatus;
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

export interface PatientRecord {
  _id: string;
  registrationNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  sex?: "MALE" | "FEMALE" | string | null;
  appointments?: Appointment[] | null;
}

export interface PatientAddVariables {
  registrationNumber: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
}

export interface PatientEditVariables extends PatientAddVariables {
  _id: string;
}

export interface AppointmentAddVariables {
  patientId: string;
  startTime: string;
  endTime: string;
  doctorId: string;
  diagnosis?: string;
}

export interface AppointmentCompleteVariables {
  appointmentId: string;
  diagnosis: string;
  examinationNotes?: string;
  symptoms?: string;
  treatment?: string;
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