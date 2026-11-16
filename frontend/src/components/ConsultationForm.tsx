import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FileText, Printer, X } from "lucide-react";
import type {
  Appointment,
  AppointmentCompleteVariables,
} from "../modules/patient/types/patient";
import {
  pageCardClass,
  pageTextAreaClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../modules/app/ui/page";

interface ConsultationFormProps {
  appointment: Appointment;
  patientName: string;
  registrationNumber: string;
  canEdit: boolean;
  saving: boolean;
  error?: string;
  onSave: (variables: AppointmentCompleteVariables) => Promise<void>;
  onClose: () => void;
  onSaved?: () => void;
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

export const ConsultationForm = ({
  appointment,
  patientName,
  registrationNumber,
  canEdit,
  saving,
  error = "",
  onSave,
  onClose,
  onSaved,
}: ConsultationFormProps) => {
  const [examinationNotes, setExaminationNotes] = useState(appointment.examinationNotes ?? "");
  const [symptoms, setSymptoms] = useState(appointment.symptoms ?? "");
  const [treatment, setTreatment] = useState(appointment.treatment ?? "");
  const [diagnosis, setDiagnosis] = useState(appointment.diagnosis ?? "");
  const [saved, setSaved] = useState(appointment.status === "COMPLETED");
  const [validationError, setValidationError] = useState("");
  const isReadOnly = appointment.status === "CANCELLED" || !canEdit;

  const markChanged = () => {
    setSaved(false);
    setValidationError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isReadOnly) return;
    if (!diagnosis.trim()) {
      setValidationError("Оношоо оруулна уу.");
      return;
    }

    setValidationError("");
    try {
      await onSave({
        appointmentId: appointment._id,
        diagnosis: diagnosis.trim(),
        examinationNotes: examinationNotes.trim(),
        symptoms: symptoms.trim(),
        treatment: treatment.trim(),
      });
      setSaved(true);
      onSaved?.();
    } catch {
      // The parent surfaces the mutation error through the error prop.
    }
  };

  const printReport = () => window.print();

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#29261f]/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
        <section
          aria-labelledby="consultation-title"
          aria-modal="true"
          className={`${pageCardClass} max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] sm:rounded-[24px]`}
          role="dialog"
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stone-200 bg-white/95 px-6 py-5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f1ece3] text-[#89785f]">
                <FileText size={18} />
              </div>
              <div>
                <h2 id="consultation-title" className="text-2xl font-bold text-stone-900">
                  Үзлэгийн тэмдэглэл
                </h2>
                <p className="mt-1 text-xs text-[#89847b]">
                  {patientName} · {formatDate(appointment.startTime)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Хаах"
              className="rounded-lg p-2 text-[#89847b] transition hover:bg-[#f1eee8] hover:text-[#45413b]"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            <div className="grid gap-3 rounded-xl border border-[#ece8e1] bg-white p-4 text-sm sm:grid-cols-2">
              <p>
                <span className="text-[#89847b]">Үйлчлүүлэгч: </span>
                <span className="font-medium text-[#45413b]">{patientName || "—"}</span>
              </p>
              <p>
                <span className="text-[#89847b]">Регистр: </span>
                <span className="font-medium text-[#45413b]">{registrationNumber || "—"}</span>
              </p>
              <p>
                <span className="text-[#89847b]">Эмч: </span>
                <span className="font-medium text-[#45413b]">{appointment.doctorName}</span>
              </p>
              <p>
                <span className="text-[#89847b]">Цаг: </span>
                <span className="font-medium text-[#45413b]">
                  {formatTime(appointment.startTime)}–{formatTime(appointment.endTime)}
                </span>
              </p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#514a40]">Зовиур, шинж тэмдэг</span>
              <textarea
                value={symptoms}
                onChange={(event) => {
                  setSymptoms(event.target.value);
                  markChanged();
                }}
                disabled={isReadOnly}
                rows={3}
                className={pageTextAreaClass}
                placeholder="Үйлчлүүлэгчийн зовиур, илэрсэн шинж тэмдгийг тэмдэглэнэ үү."
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#514a40]">Үзлэг, эмчийн тэмдэглэл</span>
              <textarea
                value={examinationNotes}
                onChange={(event) => {
                  setExaminationNotes(event.target.value);
                  markChanged();
                }}
                disabled={isReadOnly}
                rows={4}
                className={pageTextAreaClass}
                placeholder="Үзлэгийн үр дүн, ажиглалтыг тэмдэглэнэ үү."
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#514a40]">Эмчилгээ, зөвлөгөө</span>
              <textarea
                value={treatment}
                onChange={(event) => {
                  setTreatment(event.target.value);
                  markChanged();
                }}
                disabled={isReadOnly}
                rows={3}
                className={pageTextAreaClass}
                placeholder="Эмчилгээ, зөвлөгөө болон дараагийн алхмыг тэмдэглэнэ үү."
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#514a40]">Онош</span>
              <textarea
                value={diagnosis}
                onChange={(event) => {
                  setDiagnosis(event.target.value);
                  markChanged();
                }}
                disabled={isReadOnly}
                rows={3}
                required={!isReadOnly}
                className={pageTextAreaClass}
                placeholder="Оношоо оруулна уу."
              />
            </label>

            {(validationError || error) && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {validationError || error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-[#f0ede8] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className={secondaryButtonClass}
              >
                Хаах
              </button>
              {saved && (
                <button
                  type="button"
                  onClick={printReport}
                  className={secondaryButtonClass}
                >
                  <Printer size={16} /> PDF / Хэвлэх
                </button>
              )}
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={saving}
                  className={primaryButtonClass}
                >
                  {saving ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>

      <article id="consultation-print" className="print-report" aria-hidden="true">
        <header className="border-b-2 border-[#8b7658] pb-5">
          <h1 className="text-2xl font-bold tracking-wide">Dr.Munkh</h1>
          <p className="mt-1 text-sm text-gray-600">Эмнэлгийн үзлэгийн тайлан</p>
        </header>
        <section className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <p><strong>Үйлчлүүлэгч:</strong> {patientName || "—"}</p>
          <p><strong>Регистр:</strong> {registrationNumber || "—"}</p>
          <p><strong>Эмч:</strong> {appointment.doctorName}</p>
          <p><strong>Үзлэгийн огноо:</strong> {formatDate(appointment.startTime)}</p>
          <p><strong>Цаг:</strong> {formatTime(appointment.startTime)}–{formatTime(appointment.endTime)}</p>
        </section>
        <ReportSection title="Зовиур, шинж тэмдэг" value={symptoms} />
        <ReportSection title="Үзлэг, эмчийн тэмдэглэл" value={examinationNotes} />
        <ReportSection title="Онош" value={diagnosis} />
        <ReportSection title="Эмчилгээ, зөвлөгөө" value={treatment} />
      </article>
    </>,
    document.body,
  );
};

const ReportSection = ({ title, value }: { title: string; value: string }) => (
  <section className="mt-7 break-inside-avoid">
    <h2 className="border-b border-gray-300 pb-2 text-sm font-semibold uppercase tracking-wide">
      {title}
    </h2>
    <p className="mt-3 min-h-8 whitespace-pre-wrap text-sm leading-6">{value || "—"}</p>
  </section>
);
