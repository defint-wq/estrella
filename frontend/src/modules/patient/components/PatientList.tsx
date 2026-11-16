import { useState } from "react";
import { Search } from "lucide-react";
import { InfiniteScrollTrigger } from "../../../components/InfiniteScrollTrigger";
import type {
  Appointment,
  AppointmentCompleteVariables,
  PatientRecord,
} from "../types/patient";
import { PatientCard } from "./PatientCard";

interface PatientListProps {
  patients: PatientRecord[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
  canSchedule: boolean;
  canManage: boolean;
  deletingPatient: boolean;
  onSchedule: (patientId: string) => void;
  onEdit: (patient: PatientRecord) => void;
  onDelete: (patient: PatientRecord) => void;
  onCancelAppointment: (appointmentId: string) => void;
  cancellingAppointment: boolean;
  cancelError: string | null;
  onCompleteAppointment: (
    variables: AppointmentCompleteVariables,
  ) => Promise<void>;
  completingAppointment: boolean;
  completionError: string | null;
  canEditAppointment: (appointment: Appointment) => boolean;
}

export const PatientList = ({
  patients,
  searchQuery,
  loading,
  error,
  hasMore,
  loadingMore,
  loadMoreError,
  onLoadMore,
  canSchedule,
  canManage,
  deletingPatient,
  onSchedule,
  onEdit,
  onDelete,
  onCancelAppointment,
  cancellingAppointment,
  cancelError,
  onCompleteAppointment,
  completingAppointment,
  completionError,
  canEditAppointment,
}: PatientListProps) => {
  const [activeHistoryPatientId, setActiveHistoryPatientId] = useState<
    string | null
  >(null);

  if (loading) {
    return (
      <div className="grid gap-3" role="status">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-[92px] animate-pulse rounded-2xl border border-stone-200 bg-white"
          />
        ))}
        <p className="pt-1 text-center text-xs text-stone-500">
          Уншиж байна... Сервер унтсан байвал асахад 30–60 секунд хүлээнэ үү.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center text-sm text-rose-700"
      >
        Алдаа: {error}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {patients.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-12 text-center">
          <Search size={20} className="text-stone-400" />
          <p className="text-sm text-stone-500">
            {searchQuery.trim()
              ? "Хайлтад тохирох үйлчлүүлэгч олдсонгүй."
              : "Бүртгэлтэй үйлчлүүлэгч одоогоор байхгүй байна."}
          </p>
        </div>
      )}

      {patients.map((patient) => (
        <PatientCard
          key={patient._id}
          patient={patient}
          historyExpanded={activeHistoryPatientId === patient._id}
          canSchedule={canSchedule}
          canManage={canManage}
          isDeleting={deletingPatient}
          onToggleHistory={(patientId) =>
            setActiveHistoryPatientId((current) =>
              current === patientId ? null : patientId,
            )
          }
          onSchedule={onSchedule}
          onEdit={onEdit}
          onDelete={onDelete}
          onCancelAppointment={onCancelAppointment}
          cancellingAppointment={cancellingAppointment}
          cancelError={cancelError}
          onCompleteAppointment={onCompleteAppointment}
          completingAppointment={completingAppointment}
          completionError={completionError}
          canEditAppointment={canEditAppointment}
        />
      ))}

      <InfiniteScrollTrigger
        hasMore={hasMore}
        loading={loadingMore}
        error={loadMoreError}
        onLoadMore={onLoadMore}
      />
    </div>
  );
};
