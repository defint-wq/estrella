import { GraphQLError } from 'graphql';
import { IContext } from '../../../connectionResolver.js'; // 👈 .js өргөтгөл нэмэв

export const patientMutations = {
  patientAdd: async (_parent: any, args: any, context: IContext) => {
    const { registrationNumber, firstName, lastName, age, sex } = args;

    if (age <= 0 || age > 130) {
      throw new GraphQLError('Нас 1-ээс 130-ийн хооронд байх ёстой!', {
        extensions: { code: 'BAD_USER_INPUT', argumentName: 'age' }
      });
    }

    if (!firstName.trim() || !lastName.trim() || !registrationNumber.trim()) {
      throw new GraphQLError('Регистрийн дугаар, нэр, овгийг заавал бөглөнө үү.', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    // 2. Давхардсан РД шалгах
    const existingPatient = await context.models.Patients.findOne({ registrationNumber });
    if (existingPatient) {
      throw new GraphQLError('Энэ регистрийн дугаартай өвчтөн аль хэдийн бүртгэгдсэн байна!', {
        extensions: { code: 'BAD_USER_INPUT', argumentName: 'registrationNumber' }
      });
    }

    try {
      const newPatient = await context.models.Patients.create({
        registrationNumber,
        firstName,
        lastName,
        age,
        sex,
      });
      return newPatient;
    } catch (error) {
      console.error("Patient үүсгэхэд алдаа гарлаа:", error);
      throw new GraphQLError('Баазтай холбогдоход алдаа гарлаа.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  }
};