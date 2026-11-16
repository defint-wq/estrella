import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import type { EmployeeProfile, ProfileFormValues } from "../profileTypes";

const ME_PROFILE = gql`
  query MeProfile {
    me {
      _id
      name
      firstName
      lastName
      age
      gender
      avatar
      phone
      registerNumber
      username
      role
    }
  }
`;

const UPDATE_EMPLOYEE_PROFILE = gql`
  mutation UpdateMyProfile(
    $firstName: String
    $lastName: String
    $phone: String
    $password: String
    $avatar: String
  ) {
    updateMyProfile(
      firstName: $firstName
      lastName: $lastName
      phone: $phone
      password: $password
      avatar: $avatar
    ) {
      _id
      name
      firstName
      lastName
      age
      gender
      avatar
      phone
      registerNumber
      username
      role
    }
  }
`;

type ProfileUpdateVariables = Omit<
  ProfileFormValues,
  "password" | "avatar"
> & {
  password: string | null;
  avatar: string | null;
};

interface UseProfileOptions {
  onSaved: (employee: EmployeeProfile) => void;
}

export const useProfile = ({ onSaved }: UseProfileOptions) => {
  const { data, loading, error: queryError } = useQuery<{
    me: EmployeeProfile;
  }>(ME_PROFILE, { fetchPolicy: "no-cache" });
  const [
    update,
    {
      data: updateData,
      loading: saving,
      error: mutationError,
    },
  ] = useMutation<
    { updateMyProfile: EmployeeProfile },
    ProfileUpdateVariables
  >(UPDATE_EMPLOYEE_PROFILE, {
    onCompleted: ({ updateMyProfile }) => onSaved(updateMyProfile),
  });

  return {
    employee: updateData?.updateMyProfile ?? data?.me,
    loading,
    saving,
    queryError,
    mutationError,
    updateProfile: (variables: ProfileUpdateVariables) =>
      update({ variables }),
  };
};
