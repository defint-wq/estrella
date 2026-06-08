import { gql } from "@apollo/client";

export const PATIENT_ADD = gql`
  mutation PatientAdd(
    $registrationNumber: String!
    $firstName: String!
    $lastName: String!
    $age: Int!
    $sex: String
  ) {
    patientAdd(
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
      appointments {
        _id
        startTime
        endTime
        doctorName
        status
        diagnosis
      }
    }
  }
`;