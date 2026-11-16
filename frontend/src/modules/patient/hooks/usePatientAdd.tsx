import { useMutation } from "@apollo/client/react";
import { PATIENT_ADD } from "../graphql/mutation/patientAdd";
import type { PatientAddVariables } from "../types/patient";

export const usePatientAdd = () => {
  const [mutate, { loading, error }] = useMutation(PATIENT_ADD, {
    refetchQueries: ["GetPatients"],
    awaitRefetchQueries: true,
  });

  return {
    loading,
    error,
    addPatient: (variables: PatientAddVariables) =>
      mutate({ variables }),
  };
};