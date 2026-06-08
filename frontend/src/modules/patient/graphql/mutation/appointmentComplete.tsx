import { gql } from "@apollo/client";

export const APPOINTMENT_COMPLETE = gql`
  mutation CompleteAppointment($appointmentId: ID!, $diagnosis: String!) {
    appointmentComplete(appointmentId: $appointmentId, diagnosis: $diagnosis) {
      _id
      status
      diagnosis
    }
  }
`;