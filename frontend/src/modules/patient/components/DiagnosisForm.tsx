import { useState } from "react";
import { useMutation } from "@apollo/client/react";
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

  const [completeAppointment, { loading }] = useMutation(APPOINTMENT_COMPLETE, {
    onCompleted: () => {
      alert("Үзлэг амжилттай бүртгэгдлээ!");
      onSuccess();
    },
    onError: (err) => {
      alert("Алдаа гарлаа: " + err.message);
    },
  });

  const handleSave = () => {
    if (!diagnosisText.trim()) {
      alert("Та оношоо оруулна уу.");
      return;
    }

    completeAppointment({
      variables: {
        appointmentId,
        diagnosis: diagnosisText,
      },
    });
  };

  return (
    <div className="pt-2 border-t border-dashed border-amber-200 space-y-2 animate-in fade-in duration-200">
      <textarea
        value={diagnosisText}
        onChange={(e) => setDiagnosisText(e.target.value)}
        placeholder="Үйлчлүүлэгчийн онош, зөвлөгөөг энд бичнэ үү..."
        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium min-h-15"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          Цуцлах
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
        >
          {loading ? "Хадгалж байна..." : "Үзлэг дуусгах"}
        </button>
      </div>
    </div>
  );
};