import type { DashboardAppointment } from "./types";

export const getAppointmentTimestamp = (appointment: DashboardAppointment) =>
  new Date(appointment.startTime).getTime();
