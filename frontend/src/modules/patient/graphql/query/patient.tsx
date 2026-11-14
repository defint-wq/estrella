import { gql, type TypedDocumentNode } from "@apollo/client";
import type {
  PatientsQuery,
  PatientsQueryVariables,
} from "../../types/patient";

export const GET_PATIENTS: TypedDocumentNode<
  PatientsQuery,
  PatientsQueryVariables
> = gql`
  query GetPatients($page: Int, $perPage: Int, $search: String) {
    patients(page: $page, perPage: $perPage, search: $search) {
      list {
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
          examinationNotes
          symptoms
          treatment
        }
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