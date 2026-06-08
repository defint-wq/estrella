import { gql, TypedDocumentNode } from "@apollo/client";
import { PatientsQuery } from "../../types/patient"; // Таны TypeScript интерфэйс

export const GET_PATIENTS: TypedDocumentNode<PatientsQuery> = gql`
  query GetPatients($page: Int, $perPage: Int) {
    patients(page: $page, perPage: $perPage) {
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