import { gql, type TypedDocumentNode } from "@apollo/client";
import type {
  AppointmentsQuery,
  AppointmentsQueryVariables,
} from "../../types/patient";

export const GET_APPOINTMENTS: TypedDocumentNode<
  AppointmentsQuery,
  AppointmentsQueryVariables
> = gql`
  query GetAppointments(
    $page: Int
    $perPage: Int
    $search: String
    $status: AppointmentStatus
  ) {
    appointments(
      page: $page
      perPage: $perPage
      search: $search
      status: $status
    ) {
      list {
        _id
        doctorId
        startTime
        endTime
        doctorName
        status
        diagnosis
        examinationNotes
        symptoms
        treatment
        patientName
        registrationNumber
      }
      pageInfo {
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;