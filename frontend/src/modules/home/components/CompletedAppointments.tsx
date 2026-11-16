import { CalendarDays, FileText } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { AppointmentCard } from "./AppointmentCard";
import type { HomeOutletContext } from "../types";
import { getAppointmentTimestamp } from "../appointmentUtils";

export const CompletedAppointments = () => {
  const { appointments, loading, error, searchQuery, onSelectAppointment } =
    useOutletContext<HomeOutletContext>();
  const completed = appointments
    .filter(
      (appointment) => appointment.status === "COMPLETED",
    )
    .sort((a, b) => getAppointmentTimestamp(b) - getAppointmentTimestamp(a));

  if (loading) {
    return (
      <div className="grid gap-3" aria-label="Уншиж байна">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl border border-stone-200 bg-white"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center text-sm text-rose-700"
      >
        Үзлэгийн жагсаалт ачаалж чадсангүй: {error}
      </div>
    );
  }

  if (completed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-12 text-center">
        <CalendarDays size={20} className="text-[#b5ab98]" />
        <p className="text-sm text-[#9b968d]">
          {searchQuery.trim()
            ? "Хайлтад тохирох үзсэн үзлэг алга."
            : "Үзсэн үзлэг алга байна."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {completed.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          actionLabel="PDF хэвлэх / Харах"
          actionIcon={FileText}
          onAction={() => onSelectAppointment(appointment)}
        />
      ))}
    </div>
  );
};
