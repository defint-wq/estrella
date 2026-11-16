import { useMutation } from "@apollo/client/react";
import { APPOINTMENT_COMPLETE } from "../graphql/mutation/appointmentComplete";
import type { AppointmentCompleteVariables } from "../types/patient";

export const useAppointmentCompletion = () => {
  const [mutate, { loading, error }] = useMutation(APPOINTMENT_COMPLETE, {
    refetchQueries: ["GetPatients", "GetAppointments"],
    awaitRefetchQueries: true,
  });

  return {
    loading,
    error,
    completeAppointment: (variables: AppointmentCompleteVariables) =>
      mutate({ variables }),
  };
};
