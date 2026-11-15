import { gql } from "@apollo/client";

export const APPOINTMENT_ADD = gql`
  mutation AppointmentAdd(
    $patientId: ID!
    $doctorId: ID!
    $startTime: DateTime!
    $endTime: DateTime!
    $diagnosis: String
  ) {
    appointmentAdd(
      patientId: $patientId
      doctorId: $doctorId
      startTime: $startTime
      endTime: $endTime
      diagnosis: $diagnosis
    ) {
      _id
      doctorId
      startTime
      endTime
      doctorName
      status
      diagnosis
    }
  }
`;
