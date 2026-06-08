// graphql/mutation/appointmentCancel.ts
import { gql } from "@apollo/client";

export const APPOINTMENT_CANCEL = gql`
  mutation CancelAppointment($appointmentId: ID!) {
    appointmentCancel(appointmentId: $appointmentId) {
      _id
      status
      startTime
      endTime
      doctorName
      diagnosis
    }
  }
`;