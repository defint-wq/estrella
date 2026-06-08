import { gql } from "@apollo/client";

export const PATIENT_EDIT = gql`
  mutation PatientEdit(
    $_id: ID!
    $registrationNumber: String!
    $firstName: String!
    $lastName: String!
    $age: Int!
    $sex: String
  ) {
    patientEdit(
      _id: $_id
      registrationNumber: $registrationNumber
      firstName: $firstName
      lastName: $lastName
      age: $age
      sex: $sex
    ) {
      _id
      registrationNumber
      firstName
      lastName
      age
      sex
    }
  }
`;
