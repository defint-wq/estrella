import { useMutation } from "@apollo/client/react";
import { PATIENT_REMOVE } from "../graphql/mutation/patientRemove";

export const usePatientRemove = () => {
  const [mutate, { loading, error }] = useMutation(PATIENT_REMOVE, {
    refetchQueries: ["GetPatients"],
    awaitRefetchQueries: true,
  });

  return {
    loading,
    error,
    removePatient: (id: string) => mutate({ variables: { ids: [id] } }),
  };
};