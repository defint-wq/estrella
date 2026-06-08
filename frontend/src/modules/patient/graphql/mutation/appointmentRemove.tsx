import { gql } from "@apollo/client";

export const APPOINTMENT_REMOVE = gql`
  mutation AppointmentRemove($_id: ID!) {
    appointmentRemove(_id: $_id)
  }
`;