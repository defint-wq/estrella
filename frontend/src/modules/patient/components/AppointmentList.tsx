import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  CalendarDays, CheckCircle2, Clock, Eye, FileText, Stethoscope, Trash2, XCircle,
} from "lucide-react";
import { ConsultationForm } from "./ConsultationForm";
import { APPOINTMENT_CANCEL } from "../graphql/mutation/appointmentCancel";

interface Appointment {
  _id: string;
  startTime: string;
  endTime: string;
  doctorName: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  diagnosis?: string;
  examinationNotes?: string;
  symptoms?: string;
  treatment?: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  patientName: string;
  registrationNumber: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef3ed] px-2.5 py-1 text-[10px] font-medium text-[#70806b]">
        <CheckCircle2 size={12} /> Үзсэн
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8ebe8] px-2.5 py-1 text-[10px] font-medium text-[#b0645a]">
        <XCircle size={12} /> Цуцалсан
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f0e6] px-2.5 py-1 text-[10px] font-medium text-[#987b53]">
      <span className="size-1.5 rounded-full bg-[#bd9a68]" /> Товлосон
    </span>
  );
};

export const AppointmentList = ({
  appointments,
  patientName,
  registrationNumber,
}: AppointmentListProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [cancelAppointment] = useMutation(APPOINTMENT_CANCEL, {
    refetchQueries: ["patients"],
    awaitRefetchQueries: true,
  });

  async function handleCancel(appointmentId: string) {
    setError("");
    setCancellingId(appointmentId);
    try {
      await cancelAppointment({ variables: { appointmentId } });
      setConfirmId(null);
    } catch (err) {
      setError("Цуцлахад алдаа гарлаа: " + (err as Error).message);
    } finally {
      setCancellingId(null);
    }
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#e4dfd6] bg-[#fbfaf8] py-8 text-center">
        <CalendarDays size={20} className="text-[#b5ab98]" />
        <p className="text-[11px] text-[#9b968d]">Үзлэг одоогоор бүртгэгдээгүй байна.</p>
      </div>
    );
  }

  // Товлосон нь дээр (хамгийн ойрынх нь эхэнд), бусад нь сүүлийнх нь эхэнд
  const sorted = [...appointments].sort((a, b) => {
    const aS = a.status === "SCHEDULED";
    const bS = b.status === "SCHEDULED";
    if (aS && !bS) return -1;
    if (!aS && bS) return 1;
    const diff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    return aS ? diff : -diff;
  });

  return (
    <div className="mt-5 space-y-3 border-t border-[#f0ede8] pt-5">
      <div className="flex items-center gap-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9b8a73]">
          Үзлэгүүд
        </p>
        <span className="rounded-md bg-[#f4f1ec] px-1.5 py-0.5 text-[9px] text-[#8b8173]">
          {sorted.length}
        </span>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[11px] font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {sorted.map((app) => {
          const isScheduled = app.status === "SCHEDULED";
          const isCancelled = app.status === "CANCELLED";
          const isConfirming = confirmId === app._id;
          const isCancelling = cancellingId === app._id;

          return (
            <div
              key={app._id}
              className={`space-y-3.5 rounded-2xl border p-4 transition ${
                isScheduled
                  ? "border-[#eadfca] bg-[#fbf7f0]"
                  : isCancelled
                  ? "border-[#efe6e3] bg-white opacity-70"
                  : "border-[#ece8e1] bg-[#fbfaf8]"
              }`}
            >
              {/* Огноо, цаг, төлөв */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] text-[#9b968d]">{formatDate(app.startTime)}</p>
                  <p
                    className={`mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.03em] ${
                      isCancelled ? "text-[#a8a197] line-through" : "text-[#34362f]"
                    }`}
                  >
                    <Clock size={14} className="text-[#a48663]" />
                    {formatTime(app.startTime)}
                    <span className="font-normal text-[#a8a197]">– {formatTime(app.endTime)}</span>
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {/* Эмч, үйлдэл */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-[11px] text-[#777168]">
                  <Stethoscope size={14} className="text-[#a48663]" />
                  <span>Хариуцсан эмч:</span>
                  <span className="rounded-md bg-[#f1eee8] px-2 py-0.5 font-medium text-[#49463f]">
                    {app.doctorName}
                  </span>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {isScheduled && (
                    isConfirming ? (
                      <>
                        <span className="text-[10px] text-[#b0645a]">Цуцлах уу?</span>
                        <button
                          type="button"
                          disabled={isCancelling}
                          onClick={() => handleCancel(app._id)}
                          className="rounded-xl bg-[#b0645a] px-3 py-2 text-[11px] font-medium text-white transition hover:bg-[#9a5148] active:scale-95 disabled:opacity-60"
                        >
                          {isCancelling ? "..." : "Тийм"}
                        </button>
                        <button
                          type="button"
                          disabled={isCancelling}
                          onClick={() => setConfirmId(null)}
                          className="rounded-xl border border-[#e9e4dc] px-3 py-2 text-[11px] font-medium text-[#777168] transition hover:bg-[#f8f6f2]"
                        >
                          Үгүй
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(app._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#ecd9d5] px-3 py-2 text-[11px] font-medium text-[#b0645a] transition hover:bg-[#f8ebe8] active:scale-95"
                      >
                        <Trash2 size={13} /> Цуцлах
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(app)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#d9cbb5] bg-[#f6f0e6] px-4 py-2.5 text-sm font-semibold text-[#725d3e] transition hover:bg-[#efe6d8]"
                  >
                    <Eye size={15} /> Үзэх
                  </button>
                </div>
              </div>

              {/* Бүртгэгдсэн онош */}
              {app.status === "COMPLETED" && app.diagnosis && (
                <div className="flex items-start gap-2.5 rounded-xl border border-[#ece8e1] bg-white p-3">
                  <FileText size={15} className="mt-0.5 shrink-0 text-[#a48663]" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9b8a73]">
                      Кабинетийн онош
                    </p>
                    <p className="text-[12px] leading-relaxed text-[#5f594f]">{app.diagnosis}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedAppointment && (
        <ConsultationForm
          key={selectedAppointment._id}
          appointment={selectedAppointment}
          patientName={patientName}
          registrationNumber={registrationNumber}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};