import { useMutation } from "@apollo/client/react";
import { PATIENT_EDIT } from "../graphql/mutation/patientEdit";
import type { PatientEditVariables } from "../types/patient";

export const usePatientEdit = () => {
  const [mutate, { loading, error }] = useMutation(PATIENT_EDIT, {
    refetchQueries: ["GetPatients"],
    awaitRefetchQueries: true,
  });

  return {
    loading,
    error,
    editPatient: (variables: PatientEditVariables) =>
      mutate({ variables }),
  };
};