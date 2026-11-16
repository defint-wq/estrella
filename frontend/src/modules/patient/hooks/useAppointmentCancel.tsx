import { useMutation } from "@apollo/client/react";
import { APPOINTMENT_CANCEL } from "../graphql/mutation/appointmentCancel";

export const useAppointmentCancel = () => {
  const [mutate, { loading, error }] = useMutation(APPOINTMENT_CANCEL, {
    refetchQueries: ["GetPatients", "GetAppointments"],
    awaitRefetchQueries: true,
  });

  return {
    loading,
    error,
    cancelAppointment: (appointmentId: string) =>
      mutate({ variables: { appointmentId } }),
  };
};
