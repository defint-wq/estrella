export const parseRegisterNumber = (register: string) => {
  const normalized = register.trim().toUpperCase();
  const match = normalized.match(/^\p{Script=Cyrillic}{2}(\d{8})$/u);
  if (!match) return null;

  const digits = match[1];
  const yearShort = Number(digits.slice(0, 2));
  const encodedMonth = Number(digits.slice(2, 4));
  const month = encodedMonth > 20 ? encodedMonth - 20 : encodedMonth;
  if (month < 1 || month > 12) return null;

  const day = Number(digits.slice(4, 6));
  const genderDigit = Number(digits[6]);
  const today = new Date();
  const birthYear =
    encodedMonth > 20
      ? 2000 + yearShort
      : yearShort <= today.getFullYear() % 100
        ? 2000 + yearShort
        : 1900 + yearShort;
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

  const sex = genderDigit % 2 === 0 ? "FEMALE" : "MALE";

  return { age, sex, birthYear, month, day };
};

export const parseEmployeeRegisterNumber = (register: string) => {
  const parsed = parseRegisterNumber(register);
  if (!parsed) return null;

  const genderDigit = Number(register.trim().slice(-1));
  return {
    age: parsed.age,
    gender: genderDigit % 2 === 0 ? "FEMALE" : "MALE",
    registerNumber: register.trim().toUpperCase(),
  } as const;
};