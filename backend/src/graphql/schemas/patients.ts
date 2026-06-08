export const types = () => `
    scalar DateTime

    enum SexStatus {
        MALE
        FEMALE
    }

    enum AppointmentStatus {
        SCHEDULED
        COMPLETED
        CANCELLED
    }

    type Appointment {
        _id: ID!
        startTime: DateTime!
        endTime: DateTime!
        doctorName: String!  
        status: AppointmentStatus
        diagnosis: String
    }

    type Patient {
        _id: ID!
        registrationNumber: String!
        firstName: String!
        lastName: String!
        age: Int!
        sex: SexStatus
        appointments: [Appointment]
    }

    type PageInfo {
        totalPages: Int
        currentPage: Int
        hasNextPage: Boolean
        hasPreviousPage: Boolean
    }

    type PatientsListResponse {
        list: [Patient]
        pageInfo: PageInfo
        totalCount: Int
    }
`;

const patientParams = `
    registrationNumber: String!
    firstName: String!
    lastName: String!
    age: Int!
    sex: String
`;

const appointmentParams = `
    patientId: ID!
    startTime: DateTime!  
    endTime: DateTime!
    doctorName: String!
    status: String
    diagnosis: String
`;

export const queries = `
    patients(page: Int, perPage: Int): PatientsListResponse!
`;

export const mutations = `
    patientAdd(${patientParams}): Patient
    patientEdit(_id: ID!, ${patientParams}): Patient
    patientRemove(ids: [ID]!): String

    appointmentAdd(${appointmentParams}): Appointment
    appointmentEdit(_id: ID!, ${appointmentParams}): Appointment
    appointmentRemove(_id: ID!): String

    appointmentComplete(appointmentId: ID!, diagnosis: String!): Appointment
    appointmentCancel(appointmentId: ID!): Appointment
`;