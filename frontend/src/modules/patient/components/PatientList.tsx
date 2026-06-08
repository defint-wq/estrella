import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  User,
  Heart,
  Plus,
  History,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { GET_PATIENTS } from "../graphql/query/patient";
import { AppointmentList } from "./AppointmentList"; // Дээрх компонентыг импортлох
import { AppointmentModal } from "./AppointentModal";

interface PatientListProps {
  searchQuery: string;
  page: number;
  perPage: number;
}

export const PatientList = ({
  searchQuery,
  page,
  perPage,
}: PatientListProps) => {
  const { data, loading, error, refetch } = useQuery(GET_PATIENTS, {
    variables: { page, perPage },
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  // Доошоо түүхээ дэлгэж харах өвчтөний ID-г хадгалах state
  const [activeHistoryPatientId, setActiveHistoryPatientId] = useState<
    string | null
  >(null);

  if (loading)
    return <div className="text-center p-8 text-gray-500">Уншиж байна...</div>;
  if (error)
    return (
      <div className="text-center p-8 text-red-500">Алдаа: {error.message}</div>
    );

  const patients = data?.patients?.list || [];

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const regNumber = patient.registrationNumber?.toLowerCase() || "";
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      regNumber.includes(searchQuery.toLowerCase())
    );
  });

  // Түүх харах товчлуур дээр дарахад нээж/хаах функц
  const toggleHistory = (patientId: string) => {
    if (activeHistoryPatientId === patientId) {
      setActiveHistoryPatientId(null); // Нээлттэй байвал хаана
    } else {
      setActiveHistoryPatientId(patientId); // Хаалттай байвал нээнэ
    }
  };

  return (
    <div className="grid gap-4 p-4 md:p-0">
      {filteredPatients.map((patient) => (
        <div
          key={patient._id}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm group transition-all"
        >
          <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold border ${
                patient.sex === "MALE"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-pink-50 text-pink-600 border-pink-100"
              }`}
            >
              {patient.firstName ? patient.firstName[0] : "P"}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">
                  {patient.lastName} {patient.firstName}
                </h3>
                <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {patient.age} нас
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-gray-500 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> ID:{" "}
                  <span className="text-gray-700 uppercase">
                    {patient.registrationNumber}
                  </span>
                </div>
                {patient.sex && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />{" "}
                    {patient.sex === "MALE" ? "Эр" : "Эм"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* ДООШОО ДЭЛГЭХ "ТҮҮХ ХАРАХ" ТОВЧЛУУР */}
              <button
                onClick={() => toggleHistory(patient._id)}
                className={`flex flex-1 md:flex-none items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeHistoryPatientId === patient._id
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <History className="w-4 h-4" />
                <span> Үзлэгүүд </span>
                {activeHistoryPatientId === patient._id ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* ЦАГ ӨГӨХ ТОВЧЛУУР */}
              <button
                onClick={() => setSelectedPatientId(patient._id)}
                className="flex flex-1 md:flex-none items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Цаг өгөх</span>
              </button>
            </div>
          </div>

          {/* ТОВЧЛУУР ДАРАГДСАН ҮЕД ЯГ КАРТ ДОТОР НЬ БҮХ ҮЗЛЭГИЙГ ДЭЛГЭЖ ХАРУУЛАХ ХЭСЭГ */}
          {activeHistoryPatientId === patient._id && (
            <AppointmentList appointments={patient.appointments || []} />
          )}
        </div>
      ))}

      {/* ЦАГ ӨГӨХ МОДАЛ */}
      {selectedPatientId && (
        <AppointmentModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onSuccess={() => {
            setSelectedPatientId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};
