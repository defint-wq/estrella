import { CalendarDays, Clock, Stethoscope, type LucideIcon } from "lucide-react";
import type { DashboardAppointment } from "../types";
import { pageCardClass, secondaryButtonClass } from "../../app/ui/page";

interface AppointmentCardProps {
  appointment: DashboardAppointment;
  actionLabel: string;
  actionIcon: LucideIcon;
  onAction: () => void;
}

const pad = (value: number) => String(value).padStart(2, "0");

const formatDate = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const AppointmentCard = ({
  appointment,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: AppointmentCardProps) => (
  <article className={`${pageCardClass} p-5 sm:p-6`}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f3f0ea] text-[#89785f]">
          <Clock size={19} />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-[#34362f]">
            {appointment.patientName || "Үйлчлүүлэгч"}
          </h2>
          <p className="mt-1 text-xs text-[#89847b]">
            Регистр: {appointment.registrationNumber}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#5f594f] sm:justify-end">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={15} className="text-[#a48663]" />
          {formatDate(appointment.startTime)}
        </span>
        <span className="inline-flex items-center gap-2 font-semibold text-[#34362f]">
          <Clock size={15} className="text-[#a48663]" />
          {formatTime(appointment.startTime)}–{formatTime(appointment.endTime)}
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-[#89847b]">
          <Stethoscope size={14} className="text-[#a48663]" />
          {appointment.doctorName}
        </span>
        <button
          type="button"
          onClick={onAction}
          className={`${secondaryButtonClass} px-4 py-2.5`}
        >
          <ActionIcon size={15} />
          {actionLabel}
        </button>
      </div>
    </div>

    {appointment.diagnosis && (
      <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9b8a73]">
          Онош
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#5f594f]">
          {appointment.diagnosis}
        </p>
      </div>
    )}
  </article>
);
