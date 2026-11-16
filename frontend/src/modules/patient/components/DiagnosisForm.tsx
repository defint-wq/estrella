import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Check, FileText } from "lucide-react";
import { APPOINTMENT_COMPLETE } from "../graphql/mutation/appointmentComplete";
import {
  pageTextAreaClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../app/ui/page";

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
        className={`${pageTextAreaClass} min-h-24`}
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
          className={`${secondaryButtonClass} px-3.5 py-2 text-xs`}
        >
          Цуцлах
        </button>
        <button
          type="button"
          disabled={loading || !diagnosisText.trim()}
          onClick={handleSave}
          className={primaryButtonClass}
        >
          <Check size={14} />
          {loading ? "Хадгалж байна..." : "Үзлэг дуусгах"}
        </button>
      </div>
    </div>
  );
};