import { CalendarDays, Eye } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { AppointmentCard } from "../../components/AppointmentCard";
import type { HomeOutletContext } from "./types";

export const PendingAppointments = () => {
  const { appointments, loading, error, searchQuery, onSelectAppointment } =
    useOutletContext<HomeOutletContext>();
  const pending = appointments.filter(
    (appointment) => appointment.status === "SCHEDULED",
  );

  if (loading) {
    return (
      <div className="grid gap-3" aria-label="Уншиж байна">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl border border-[#ece8e1] bg-white"
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

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-[#e4dfd6] bg-[#fbfaf8] py-12 text-center">
        <CalendarDays size={20} className="text-[#b5ab98]" />
        <p className="text-sm text-[#9b968d]">
          {searchQuery.trim()
            ? "Хайлтад тохирох үзээгүй үзлэг алга."
            : "Үзээгүй үзлэг алга байна."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {pending.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          actionLabel="Үзэх"
          actionIcon={Eye}
          onAction={() => onSelectAppointment(appointment)}
        />
      ))}
    </div>
  );
};
