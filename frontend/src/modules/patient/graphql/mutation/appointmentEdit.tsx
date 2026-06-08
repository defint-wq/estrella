import { gql } from "@apollo/client";

export const APPOINTMENT_EDIT = gql`
  mutation AppointmentEdit(
    $_id: ID!
    $patientId: ID!
    $startTime: DateTime!
    $endTime: DateTime!
    $doctorName: String!
    $status: String
    $diagnosis: String
  ) {
    appointmentEdit(
      _id: $_id
      patientId: $patientId
      startTime: $startTime
      endTime: $endTime
      doctorName: $doctorName
      status: $status
      diagnosis: $diagnosis
    ) {
      _id
      status
      diagnosis
    }
  }
`;
