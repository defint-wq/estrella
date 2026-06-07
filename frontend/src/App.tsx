import { gql, TypedDocumentNode } from "@apollo/client";
import { ApolloProvider, useQuery } from "@apollo/client/react";
import { useRef } from "react";
import { RouterProvider } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

interface Appointment {
  _id: string;
  date: string;
  doctorName: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  reason?: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  diagnosis?: string;
  appointments: Appointment[];
}

interface PageInfo {
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

interface PatientsQuery {
  patients: {
    list: Patient[];
    pageInfo: PageInfo;
    totalCount?: number;
  };
}

const GET_PATIENTS: TypedDocumentNode<PatientsQuery> = gql`
  query GetPatients($page: Int, $perPage: Int) {
    patients(page: $page, perPage: $perPage) {
      list {
        _id
        firstName
        lastName
        age
        diagnosis
        appointments {
          _id
          date
          doctorName
          status
          reason
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

function App() {
  return <RouterProvider router={router} />;
}

export default App;
