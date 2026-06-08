import { gql } from "@apollo/client";

export const APPOINTMENT_ADD = gql`
  mutation AppointmentAdd(
    $patientId: ID!
    $startTime: DateTime!
    $endTime: DateTime!
    $doctorName: String!
    $status: String
    $diagnosis: String
  ) {
    appointmentAdd(
      patientId: $patientId
      startTime: $startTime
      endTime: $endTime
      doctorName: $doctorName
      status: $status
      diagnosis: $diagnosis
    ) {
      _id
      startTime
      endTime
      doctorName
      status
      diagnosis
    }
  }
`;
