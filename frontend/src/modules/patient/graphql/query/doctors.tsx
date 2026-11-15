import { gql } from "@apollo/client";

export const GET_DOCTORS = gql`
  query GetDoctors($role: EmployeeRole) {
    employees(role: $role) {
      _id
      name
    }
  }
`;
