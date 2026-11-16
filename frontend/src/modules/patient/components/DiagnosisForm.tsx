import { useState } from "react";
import { Check, FileText } from "lucide-react";
import {
  pageTextAreaClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../app/ui/page";

interface AppointmentDiagnosisFormProps {
  appointmentId: string;
  initialDiagnosis?: string;
  saving: boolean;
  error?: string;
  onSave: (variables: { appointmentId: string; diagnosis: string }) => Promise<void>;
  onCancel: () => void;
}

export const AppointmentDiagnosisForm = ({
  appointmentId,
  initialDiagnosis = "",
  saving,
  error,
  onSave,
  onCancel,
}: AppointmentDiagnosisFormProps) => {
  const [diagnosisText, setDiagnosisText] = useState(initialDiagnosis);
  const [validationError, setValidationError] = useState("");

  const handleSave = async () => {
    setValidationError("");
    if (!diagnosisText.trim()) {
      setValidationError("Та оношоо оруулна уу.");
      return;
    }
    try {
      await onSave({ appointmentId, diagnosis: diagnosisText.trim() });
    } catch {
      // The parent surfaces the mutation error through the error prop.
    }
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
          if (validationError) setValidationError("");
        }}
        placeholder="Үйлчлүүлэгчийн онош, зөвлөгөөг энд бичнэ үү..."
        className={`${pageTextAreaClass} min-h-24`}
      />

      {(validationError || error) && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
          {validationError || error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`${secondaryButtonClass} px-3.5 py-2 text-xs`}
        >
          Цуцлах
        </button>
        <button
          type="button"
          disabled={saving || !diagnosisText.trim()}
          onClick={handleSave}
          className={primaryButtonClass}
        >
          <Check size={14} />
          {saving ? "Хадгалж байна..." : "Үзлэг дуусгах"}
        </button>
      </div>
    </div>
  );
};