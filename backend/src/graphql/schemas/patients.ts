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

    enum EmployeeRole {
        ADMIN
        RECEPTION
        DOCTOR
    }

    type Appointment {
        _id: ID!
        doctorId: ID
        startTime: DateTime!
        endTime: DateTime!
        doctorName: String!  
        status: AppointmentStatus
        diagnosis: String
        examinationNotes: String
        symptoms: String
        treatment: String
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

    type AppointmentSearchResult {
        _id: ID!
        doctorId: ID
        startTime: DateTime!
        endTime: DateTime!
        doctorName: String!
        status: AppointmentStatus
        diagnosis: String
        examinationNotes: String
        symptoms: String
        treatment: String
        patientName: String!
        registrationNumber: String!
    }

    type AppointmentListResponse {
        list: [AppointmentSearchResult]
        pageInfo: PageInfo
        totalCount: Int
    }

    type Employee {
        _id: ID!
        name: String!
        firstName: String!
        lastName: String!
        age: Int!
        gender: SexStatus!
        avatar: String
        phone: String!
        registerNumber: String!
        username: String!
        role: EmployeeRole!
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
    doctorId: ID!
    startTime: DateTime!  
    endTime: DateTime!
    diagnosis: String
`;

const employeeCreateParams = `
    firstName: String!
    lastName: String!
    phone: String!
    registerNumber: String!
    username: String!
    password: String!
    role: EmployeeRole!
`;

const employeeUpdateParams = `
    firstName: String
    lastName: String
    phone: String
    username: String
    registerNumber: String
    avatar: String
    role: EmployeeRole
`;

const profileUpdateParams = `
    firstName: String
    lastName: String
    phone: String
    password: String
    avatar: String
`;

export const queries = `
    patients(page: Int, perPage: Int, search: String): PatientsListResponse!
    appointments(page: Int, perPage: Int, search: String, status: AppointmentStatus): AppointmentListResponse!
    employees(role: EmployeeRole): [Employee!]!
    me: Employee!
`;

export const mutations = `
    patientAdd(${patientParams}): Patient
    patientEdit(_id: ID!, ${patientParams}): Patient
    patientRemove(ids: [ID!]!): String!

    appointmentAdd(${appointmentParams}): Appointment
    appointmentEdit(_id: ID!, ${appointmentParams}): Appointment
    appointmentRemove(_id: ID!): String

    appointmentComplete(
        appointmentId: ID!
        diagnosis: String!
        examinationNotes: String
        symptoms: String
        treatment: String
    ): Appointment
    appointmentCancel(appointmentId: ID!): Appointment

    createEmployee(${employeeCreateParams}): Employee
    employeeAdd(${employeeCreateParams}): Employee
    updateEmployee(_id: ID!, ${employeeUpdateParams}): Employee!
    deleteEmployee(_id: ID!): String!
    updateMyProfile(${profileUpdateParams}): Employee!
    employeeProfileUpdate(${profileUpdateParams}): Employee!
`;