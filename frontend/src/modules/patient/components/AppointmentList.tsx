import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Clock, CheckCircle2, XCircle, FileText, Stethoscope, Trash2 } from "lucide-react";
import { AppointmentDiagnosisForm } from "./DiagnosisForm";
import { APPOINTMENT_CANCEL } from "../graphql/mutation/appointmentCancel";

interface Appointment {
  _id: string;
  startTime: string;
  endTime: string;
  doctorName: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | string;
  diagnosis?: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
}

export const AppointmentList = ({ appointments }: AppointmentListProps) => {
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);

  const [cancelAppointment, { loading: cancelLoading }] = useMutation(APPOINTMENT_CANCEL, {
    refetchQueries: ["patients"],
    awaitRefetchQueries: true,
    onCompleted: () => {
      alert("Уулзалт амжилттай цуцлагдлаа.");
    },
    onError: (err) => {
      alert("Цуцлахад алдаа гарлаа: " + err.message);
    }
  });

  const formatTo24Hour = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Үзсэн
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-100">
            <XCircle className="w-3.5 h-3.5" /> Цуцалсан
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Товлосон
          </span>
        );
    }
  };

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-xs font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mt-4">
        Үзлэг одоогоор бүртгэгдээгүй байна.
      </div>
    );
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.status === "SCHEDULED" && b.status !== "SCHEDULED") return -1;
    if (a.status !== "SCHEDULED" && b.status === "SCHEDULED") return 1;
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  const handleCancelClick = (appointmentId: string) => {
    if (window.confirm("Та энэхүү товлосон цагийг цуцлахдаа итгэлтэй байна уу?")) {
      cancelAppointment({ variables: { appointmentId } });
    }
  };

  return (
    <div className="mt-5 pt-5 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Үзлэгүүд</p>
      
      <div className="max-h-96 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {sortedAppointments.map((app) => (
          <div 
            key={app._id} 
            className={`p-4 border rounded-2xl space-y-3.5 transition-all duration-200 ${
              app.status === "SCHEDULED"
                ? "bg-amber-50/40 border-amber-200 shadow-xs"
                : app.status === "CANCELLED"
                ? "bg-rose-50/10 border-rose-100/70"
                : "bg-gray-50/60 border-gray-200/60 hover:bg-gray-50 hover:border-gray-300/80"
            }`}
          >
            {/* Дээд хэсэг: Огноо болон Статус */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800 tracking-tight">
                {formatTo24Hour(app.startTime)}
              </span>
              {getStatusBadge(app.status)}
            </div>

            {/* Дунд хэсэг: Эмчийн нэр болон Үйлдэл хийх товчлуурууд */}
            <div className="flex justify-between items-center gap-4">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="font-medium">Хариуцсан эмч:</span>
                <span className="text-gray-800 font-bold bg-gray-100/80 px-2 py-0.5 rounded-md">{app.doctorName}</span>
              </div>

              {app.status === "SCHEDULED" && activeAppointmentId !== app._id && (
                <div className="flex gap-2 shrink-0">
                  {/* ЦУЦЛАХ ТОВЧЛУУР */}
                  <button
                    type="button"
                    disabled={cancelLoading}
                    onClick={() => handleCancelClick(app._id)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 hover:bg-rose-50 active:scale-95 text-rose-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {cancelLoading ? "..." : "Цуцлах"}
                  </button>

                  {/* ҮЗЛЭГ ХИЙХ ТОВЧЛУУР */}
                  <button
                    type="button"
                    onClick={() => setActiveAppointmentId(app._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Үзлэг хийх
                  </button>
                </div>
              )}
            </div>

            {/* ОНОШ БИЧИХ ФОРМ */}
            {activeAppointmentId === app._id && (
              <AppointmentDiagnosisForm
                appointmentId={app._id}
                initialDiagnosis={app.diagnosis}
                onCancel={() => setActiveAppointmentId(null)}
                onSuccess={() => setActiveAppointmentId(null)}
              />
            )}

            {/* БҮРТГЭГДСЭН ОНОШ */}
            {app.status === "COMPLETED" && app.diagnosis && (
              <div className="bg-white p-3 rounded-xl border border-gray-100 flex gap-2 items-start shadow-2xs">
                <FileText className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Кабинетийн онош</p>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{app.diagnosis}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};