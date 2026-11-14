export const createSearchRegex = (search?: string) => {
  const term = search?.trim();
  if (!term) return undefined;

  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escapedTerm, "i");
};

export const createPatientSearchFilter = (search?: string) => {
  const terms = search?.trim().split(/\s+/).filter(Boolean);
  if (!terms?.length) return {};

  const conditions = terms.flatMap((term) => {
    const regex = createSearchRegex(term);
    if (!regex) return [];

    return [{
      $or: [
        { firstName: regex },
        { lastName: regex },
        { registrationNumber: regex },
      ],
    }];
  });

  return conditions.length > 0
    ? { $and: conditions }
    : {};
};
