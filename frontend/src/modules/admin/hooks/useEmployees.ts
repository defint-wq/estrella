import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import type {
  CreateEmployeeVariables,
  EmployeeRecord,
  UpdateEmployeeVariables,
} from "../types/employee";

const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      _id
      name
      firstName
      lastName
      registerNumber
      avatar
      username
      phone
      role
    }
  }
`;

const ADD_EMPLOYEE = gql`
  mutation CreateEmployee(
    $firstName: String!
    $lastName: String!
    $phone: String!
    $registerNumber: String!
    $username: String!
    $password: String!
    $role: EmployeeRole!
  ) {
    createEmployee(
      firstName: $firstName
      lastName: $lastName
      phone: $phone
      registerNumber: $registerNumber
      username: $username
      password: $password
      role: $role
    ) {
      _id
      username
      firstName
      lastName
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee(
    $_id: ID!
    $firstName: String
    $lastName: String
    $phone: String
    $username: String
    $registerNumber: String
    $avatar: String
    $role: EmployeeRole
  ) {
    updateEmployee(
      _id: $_id
      firstName: $firstName
      lastName: $lastName
      phone: $phone
      username: $username
      registerNumber: $registerNumber
      avatar: $avatar
      role: $role
    ) {
      _id
      firstName
      lastName
      username
      phone
      registerNumber
      avatar
      role
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($_id: ID!) {
    deleteEmployee(_id: $_id)
  }
`;

export const useEmployees = () => {
  const { data, loading, error } = useQuery<{ employees: EmployeeRecord[] }>(
    GET_EMPLOYEES,
  );
  const [
    createMutation,
    { loading: creating, error: createError },
  ] = useMutation(ADD_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
    awaitRefetchQueries: true,
  });
  const [
    updateMutation,
    { loading: updating, error: updateError },
  ] = useMutation(UPDATE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
    awaitRefetchQueries: true,
  });
  const [
    deleteMutation,
    { loading: deleting, error: deleteError },
  ] = useMutation(DELETE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
    awaitRefetchQueries: true,
  });

  return {
    employees: data?.employees ?? [],
    loading,
    error,
    creating,
    createError,
    createEmployee: (variables: CreateEmployeeVariables) =>
      createMutation({ variables }),
    updating,
    updateError,
    updateEmployee: (variables: UpdateEmployeeVariables) =>
      updateMutation({ variables }),
    deleting,
    deleteError,
    deleteEmployee: (_id: string) => deleteMutation({ variables: { _id } }),
  };
};
