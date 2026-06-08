import { gql } from "@apollo/client";

export const PATIENT_REMOVE = gql`
  mutation PatientRemove($ids: [ID]!) {
    patientRemove(ids: $ids)
  }
`;
