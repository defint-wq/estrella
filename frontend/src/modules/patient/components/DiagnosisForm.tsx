import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Check, FileText } from "lucide-react";
import { APPOINTMENT_COMPLETE } from "../graphql/mutation/appointmentComplete";

interface AppointmentDiagnosisFormProps {
  appointmentId: string;
  initialDiagnosis?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AppointmentDiagnosisForm = ({
  appointmentId,
  initialDiagnosis = "",
  onCancel,
  onSuccess,
}: AppointmentDiagnosisFormProps) => {
  const [diagnosisText, setDiagnosisText] = useState(initialDiagnosis);
  const [error, setError] = useState("");

  const [completeAppointment, { loading }] = useMutation(APPOINTMENT_COMPLETE, {
    onCompleted: () => onSuccess(),
    onError: (err) => setError("Алдаа гарлаа: " + err.message),
  });

  const handleSave = () => {
    setError("");
    if (!diagnosisText.trim()) {
      setError("Та оношоо оруулна уу.");
      return;
    }
    completeAppointment({
      variables: { appointmentId, diagnosis: diagnosisText.trim() },
    });
  };

  return (
    <div className="space-y-3 border-t border-dashed border-[#e3d6bd] pt-4">
      <label
        htmlFor={`diagnosis-${appointmentId}`}
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9b8a73]"
      >
        <FileText size={13} /> Онош, зөвлөгөө
      </label>

      <textarea
        id={`diagnosis-${appointmentId}`}
        autoFocus
        rows={4}
        value={diagnosisText}
        onChange={(e) => {
          setDiagnosisText(e.target.value);
          if (error) setError("");
        }}
        placeholder="Үйлчлүүлэгчийн онош, зөвлөгөөг энд бичнэ үү..."
        className="min-h-24 w-full resize-y rounded-xl border border-[#e8e3db] bg-white px-3.5 py-3 text-[12px] leading-relaxed text-[#37342f] outline-none transition placeholder:text-[#b7b1a9] focus:border-[#ad9272] focus:ring-4 focus:ring-[#ad9272]/10"
      />

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-[#e9e4dc] bg-white px-3.5 py-2 text-[11px] font-medium text-[#777168] transition hover:bg-[#f8f6f2] disabled:opacity-60"
        >
          Цуцлах
        </button>
        <button
          type="button"
          disabled={loading || !diagnosisText.trim()}
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-stone-700 px-5 py-3 text-sm font-bold tracking-wide text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-500/25 disabled:cursor-not-allowed disabled:bg-[#d9d5cc] disabled:text-[#9a948a] disabled:shadow-none"
        >
          <Check size={14} />
          {loading ? "Хадгалж байна..." : "Үзлэг дуусгах"}
        </button>
      </div>
    </div>
  );
};