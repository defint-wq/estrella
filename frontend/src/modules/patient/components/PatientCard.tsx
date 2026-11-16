import {
  ChevronDown,
  ChevronUp,
  History,
  Pencil,
  Plus,
  Trash2,
  User,
  UserRound,
} from "lucide-react";
import { AppointmentList } from "./AppointmentList";
import type {
  Appointment,
  AppointmentCompleteVariables,
  PatientRecord,
} from "../types/patient";
import {
  dangerButtonClass,
  pageCardClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../app/ui/page";

interface PatientCardProps {
  patient: PatientRecord;
  historyExpanded: boolean;
  canSchedule: boolean;
  canManage: boolean;
  isDeleting: boolean;
  onToggleHistory: (patientId: string) => void;
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

export const PatientCard = ({
  patient,
  historyExpanded,
  canSchedule,
  canManage,
  isDeleting,
  onToggleHistory,
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
}: PatientCardProps) => {
  const isMale = patient.sex === "MALE";
  const scheduledCount =
    patient.appointments?.filter((appointment) => appointment.status === "SCHEDULED")
      .length ?? 0;
  const fullName =
    `${patient.lastName ?? ""} ${patient.firstName ?? ""}`.trim() ||
    "Үйлчлүүлэгч";

  return (
    <article
      className={`${pageCardClass} p-5 transition hover:border-stone-300 sm:p-6`}
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            isMale ? "bg-[#dce4dc] text-[#526458]" : "bg-[#e7dfeb] text-[#695a70]"
          }`}
        >
          {patient.firstName?.[0]?.toUpperCase() ?? "P"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold text-stone-900">
              {patient.lastName} {patient.firstName}
            </h2>
            {patient.age != null && (
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                {patient.age} нас
              </span>
            )}
            {scheduledCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f0e6] px-2.5 py-0.5 text-xs font-medium text-[#987b53]">
                <span className="size-1.5 rounded-full bg-[#bd9a68]" />
                {scheduledCount} товлосон
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-stone-400" />
              <span className="uppercase tracking-wide text-stone-700">
                {patient.registrationNumber}
              </span>
            </span>
            {patient.sex && (
              <span className="flex items-center gap-1.5">
                <UserRound size={13} className="text-stone-400" />
                <span className="text-stone-700">{isMale ? "Эр" : "Эм"}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <button
            type="button"
            onClick={() => onToggleHistory(patient._id)}
            aria-expanded={historyExpanded}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition md:flex-none ${
              historyExpanded
                ? "border-[#e3d6bd] bg-[#fbf7f0] text-[#7d6540]"
                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            <History size={14} />
            <span>Үзлэгүүд</span>
            {historyExpanded ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </button>

          {canSchedule && (
            <button
              type="button"
              onClick={() => onSchedule(patient._id)}
              className={`${primaryButtonClass} flex-1 md:flex-none`}
            >
              <Plus size={14} />
              <span>Цаг өгөх</span>
            </button>
          )}
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEdit(patient)}
                aria-label={`${fullName} мэдээлэл засах`}
                title="Засах"
                className={`${secondaryButtonClass} size-10 p-0`}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(patient)}
                disabled={isDeleting}
                aria-label={`${fullName} устгах`}
                title="Устгах"
                className={`${dangerButtonClass} size-10 p-0`}
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {historyExpanded && (
        <AppointmentList
          appointments={patient.appointments || []}
          patientName={fullName}
          registrationNumber={patient.registrationNumber ?? ""}
          onCancelAppointment={onCancelAppointment}
          cancellingAppointment={cancellingAppointment}
          cancelError={cancelError}
          onCompleteAppointment={onCompleteAppointment}
          completingAppointment={completingAppointment}
          completionError={completionError}
          canEditAppointment={canEditAppointment}
        />
      )}
    </article>
  );
};
