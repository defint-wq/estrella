import { gql } from "@apollo/client";

export const APPOINTMENT_COMPLETE = gql`
  mutation CompleteAppointment(
    $appointmentId: ID!
    $diagnosis: String!
    $examinationNotes: String
    $symptoms: String
    $treatment: String
  ) {
    appointmentComplete(
      appointmentId: $appointmentId
      diagnosis: $diagnosis
      examinationNotes: $examinationNotes
      symptoms: $symptoms
      treatment: $treatment
    ) {
      _id
      status
      diagnosis
      examinationNotes
      symptoms
      treatment
    }
  }
`;