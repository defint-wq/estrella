import { useMutation, useQuery } from "@apollo/client/react";
import { APPOINTMENT_ADD } from "../graphql/mutation/appointmentAdd";
import { GET_DOCTORS } from "../graphql/query/doctors";
import { GET_PATIENTS } from "../graphql/query/patient";
import type {
  AppointmentAddVariables,
  PatientsQuery,
} from "../types/patient";

interface DoctorsQuery {
  employees: Array<{ _id: string; name: string }>;
}

export const useAppointmentBooking = (enabled: boolean) => {
  const {
    data: patientsData,
    loading: patientsLoading,
    error: patientsError,
  } = useQuery<PatientsQuery>(GET_PATIENTS, {
    variables: { page: 1, perPage: 100 },
    skip: !enabled,
  });
  const {
    data: doctorsData,
    loading: doctorsLoading,
    error: doctorsError,
  } = useQuery<DoctorsQuery>(GET_DOCTORS, {
    variables: { role: "DOCTOR" },
    skip: !enabled,
  });
  const [mutate, { loading: saving, error: mutationError }] = useMutation(
    APPOINTMENT_ADD,
    { refetchQueries: ["GetPatients", "GetAppointments"] },
  );

  const doctors = doctorsData?.employees ?? [];

  const isTimeSlotBusy = (
    date: string,
    time: string,
    doctorId: string,
  ): boolean => {
    const doctor = doctors.find((item) => item._id === doctorId);
    if (!doctor || !time) return false;

    const start = new Date(`${date}T${time}:00`).getTime();
    const end = start + 20 * 60 * 1000;
    for (const patient of patientsData?.patients.list ?? []) {
      for (const appointment of patient.appointments ?? []) {
        if (appointment.status === "CANCELLED") continue;
        if (
          appointment.doctorId
            ? appointment.doctorId !== doctorId
            : appointment.doctorName !== doctor.name
        ) {
          continue;
        }

        const appointmentStart = new Date(appointment.startTime).getTime();
        const appointmentEnd = new Date(appointment.endTime).getTime();
        if (start < appointmentEnd && end > appointmentStart) return true;
      }
    }
    return false;
  };

  return {
    doctors,
    patients: patientsData?.patients.list ?? [],
    loading: patientsLoading || doctorsLoading,
    error: patientsError ?? doctorsError ?? mutationError,
    saving,
    isTimeSlotBusy,
    addAppointment: (variables: AppointmentAddVariables) =>
      mutate({ variables }),
  };
};
