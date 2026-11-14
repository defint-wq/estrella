import type {
  AppointmentSearchResult,
} from "../../modules/patient/types/patient";

export type DashboardAppointment = AppointmentSearchResult;

export interface HomeOutletContext {
  appointments: DashboardAppointment[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSelectAppointment: (appointment: DashboardAppointment) => void;
}
