import type { EmployeeGender } from "../../@types/Employee.js";

export const parseEmployeeRegisterNumber = (value: string) => {
  const registerNumber = value.trim().toUpperCase();
  const match = registerNumber.match(/^(\p{Script=Cyrillic}{2})(\d{8})$/u);
  if (!match) return null;

  const digits = match[2];
  const yearShort = Number(digits.slice(0, 2));
  const encodedMonth = Number(digits.slice(2, 4));
  const month = encodedMonth > 20 ? encodedMonth - 20 : encodedMonth;
  if (month < 1 || month > 12) return null;

  const today = new Date();
  const birthYear =
    encodedMonth > 20
      ? 2000 + yearShort
      : yearShort <= today.getFullYear() % 100
        ? 2000 + yearShort
        : 1900 + yearShort;
  const day = Number(digits.slice(4, 6));
  const birthDate = new Date(birthYear, month - 1, day);
  if (
    birthDate.getFullYear() !== birthYear ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day ||
    birthDate > today
  ) {
    return null;
  }

  let age = today.getFullYear() - birthYear;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }

  const genderDigit = Number(digits[7]);
  const gender: EmployeeGender =
    genderDigit % 2 === 0 ? "FEMALE" : "MALE";

  return { age, gender, registerNumber };
};
