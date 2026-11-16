import { useState } from "react";
import { Check, Search, UserPlus } from "lucide-react";
import {
  PageContainer,
  PageContent,
  primaryButtonClass,
} from "../app/ui/page";
import { useAuth } from "../auth/AuthContext";
import { useAppointmentBooking } from "./hooks/useAppointmentBooking";
import { useAppointmentCancel } from "./hooks/useAppointmentCancel";
import { useAppointmentCompletion } from "./hooks/useAppointmentCompletion";
import { usePatientAdd } from "./hooks/usePatientAdd";
import { usePatientEdit } from "./hooks/usePatientEdit";
import { usePatientRemove } from "./hooks/usePatientRemove";
import { usePatients } from "./hooks/usePatients";
import { AppointmentModal } from "./components/AppointentModal";
import { PatientEditModal, type PatientEditRecord } from "./components/PatientEditModal";
import PatientHeader from "./components/PatientHeader";
import { PatientList } from "./components/PatientList";
import { PatientAddModal } from "./components/PatientModal";
import type {
  Appointment,
  AppointmentAddVariables,
  AppointmentCompleteVariables,
  PatientAddVariables,
  PatientEditVariables,
  PatientRecord,
} from "./types/patient";

export const PatientPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [editingPatient, setEditingPatient] =
    useState<PatientEditRecord | null>(null);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const patientQuery = usePatients(searchQuery);
  const addPatient = usePatientAdd();
  const editPatient = usePatientEdit();
  const removePatient = usePatientRemove();
  const appointmentBooking = useAppointmentBooking(selectedPatientId !== null);
  const appointmentCancel = useAppointmentCancel();
  const appointmentCompletion = useAppointmentCompletion();

  const canManagePatients =
    user?.role === "ADMIN" || user?.role === "RECEPTION";

  const handleAddPatient = (variables: PatientAddVariables) => {
    setActionError("");
    void addPatient.addPatient(variables).then(
      () => {
        setIsAddModalOpen(false);
        setNotice("Үйлчлүүлэгч амжилттай бүртгэгдлээ.");
      },
      (cause: unknown) => setActionError(getErrorMessage(cause)),
    );
  };

  const handleEditPatient = (variables: PatientEditVariables) => {
    setActionError("");
    void editPatient.editPatient(variables).then(
      () => {
        setEditingPatient(null);
        setNotice("Үйлчлүүлэгчийн мэдээлэл шинэчлэгдлээ.");
      },
      (cause: unknown) => setActionError(getErrorMessage(cause)),
    );
  };

  const handleRemovePatient = async (patient: PatientRecord) => {
    const name =
      `${patient.lastName ?? ""} ${patient.firstName ?? ""}`.trim() ||
      "Энэ үйлчлүүлэгч";
    if (
      !window.confirm(
        `${name}-г устгавал түүнтэй холбоотой бүх цагийн бүртгэл мөн устна. Үргэлжлүүлэх үү?`,
      )
    ) {
      return;
    }

    setDeletingPatientId(patient._id);
    setActionError("");
    try {
      await removePatient.removePatient(patient._id);
      setNotice("Үйлчлүүлэгч болон холбогдох цагийн бүртгэлүүд устгагдлаа.");
    } catch (cause) {
      setActionError(getErrorMessage(cause));
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handleBookAppointment = (variables: AppointmentAddVariables) => {
    setActionError("");
    void appointmentBooking.addAppointment(variables).then(
      () => {
        setSelectedPatientId(null);
        setNotice("Цаг амжилттай товлогдлоо.");
      },
      (cause: unknown) => setActionError(getErrorMessage(cause)),
    );
  };

  const handleCancelAppointment = (appointmentId: string) => {
    void appointmentCancel.cancelAppointment(appointmentId).catch(() => undefined);
  };

  const handleCompleteAppointment = async (
    variables: AppointmentCompleteVariables,
  ) => {
    await appointmentCompletion.completeAppointment(variables);
  };

  const canEditAppointment = (appointment: Appointment) =>
    user?.role === "ADMIN" ||
    (user?.role === "DOCTOR" && appointment.doctorId === user._id);

  const pageError =
    actionError ||
    removePatient.error?.message ||
    "";

  return (
    <PageContainer>
      <PageContent>
        <div className="sticky top-0 z-30 bg-[#FAF8F5]/95 pb-4 pt-2 backdrop-blur-md">
          <PatientHeader
            action={
              canManagePatients ? (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className={`${primaryButtonClass} h-11 w-full whitespace-nowrap sm:w-auto`}
                >
                  <UserPlus size={15} />
                  Үйлчлүүлэгч нэмэх
                </button>
              ) : undefined
            }
          />
          <label className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] px-4 text-stone-500 transition focus-within:ring-2 focus-within:ring-stone-900">
            <Search size={16} className="shrink-0" />
            <input
              type="search"
              aria-label="Үйлчлүүлэгч хайх"
              placeholder="Үйлчлүүлэгчийн нэр эсвэл регистрээр хайх..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:ring-0"
            />
          </label>
        </div>

        {notice && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-[#dce6da] bg-[#f3f7f1] px-4 py-3 text-xs text-[#597052]"
          >
            <Check size={15} /> {notice}
          </div>
        )}
        {pageError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {pageError}
          </p>
        )}

        <PatientList
          patients={patientQuery.patients}
          searchQuery={searchQuery}
          loading={patientQuery.loading}
          error={patientQuery.error?.message ?? null}
          hasMore={patientQuery.hasMore}
          loadingMore={patientQuery.isRefreshing || patientQuery.loadingMore}
          loadMoreError={patientQuery.loadMoreError}
          onLoadMore={patientQuery.loadMore}
          canSchedule={user?.role !== "DOCTOR"}
          canManage={canManagePatients}
          deletingPatient={deletingPatientId !== null}
          onSchedule={setSelectedPatientId}
          onEdit={(patient) => setEditingPatient(patient)}
          onDelete={(patient) => void handleRemovePatient(patient)}
          onCancelAppointment={handleCancelAppointment}
          cancellingAppointment={appointmentCancel.loading}
          cancelError={appointmentCancel.error?.message ?? null}
          onCompleteAppointment={handleCompleteAppointment}
          completingAppointment={appointmentCompletion.loading}
          completionError={appointmentCompletion.error?.message ?? null}
          canEditAppointment={canEditAppointment}
        />

        {isAddModalOpen && canManagePatients && (
          <PatientAddModal
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddPatient}
            loading={addPatient.loading}
            error={addPatient.error?.message}
          />
        )}
        {editingPatient && canManagePatients && (
          <PatientEditModal
            patient={editingPatient}
            onClose={() => setEditingPatient(null)}
            onSubmit={handleEditPatient}
            loading={editPatient.loading}
            error={editPatient.error?.message}
          />
        )}
        {selectedPatientId && (
          <AppointmentModal
            patientId={selectedPatientId}
            patients={appointmentBooking.patients}
            doctors={appointmentBooking.doctors}
            dataLoading={appointmentBooking.loading}
            loading={appointmentBooking.saving}
            error={appointmentBooking.error?.message}
            onSubmit={handleBookAppointment}
            onClose={() => setSelectedPatientId(null)}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

const getErrorMessage = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Үйлдлийг гүйцэтгэж чадсангүй.";
