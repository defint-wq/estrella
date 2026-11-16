import { useEffect, useState, type FormEvent } from "react";
import { Pencil, X } from "lucide-react";
import {
  pageCardClass,
  pageInputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../app/ui/page";
import type { PatientEditVariables } from "../types/patient";

export interface PatientEditRecord {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  registrationNumber?: string | null;
  age?: number | null;
  sex?: string | null;
}

interface PatientEditModalProps {
  patient: PatientEditRecord;
  onClose: () => void;
  onSubmit: (variables: PatientEditVariables) => void;
  loading: boolean;
  error?: string;
}

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9b8a73]";
const inputClass = pageInputClass;

export const PatientEditModal = ({
  patient,
  onClose,
  onSubmit,
  loading,
  error,
}: PatientEditModalProps) => {
  const [firstName, setFirstName] = useState(patient.firstName ?? "");
  const [lastName, setLastName] = useState(patient.lastName ?? "");
  const [registrationNumber, setRegistrationNumber] = useState(
    patient.registrationNumber ?? "",
  );
  const [age, setAge] = useState(String(patient.age ?? ""));
  const [sex, setSex] = useState(patient.sex === "FEMALE" ? "FEMALE" : "MALE");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAge = Number(age);
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !registrationNumber.trim() ||
      !Number.isInteger(parsedAge) ||
      parsedAge < 1 ||
      parsedAge > 130
    ) {
      setValidationError("Мэдээллийг зөв бөглөнө үү.");
      return;
    }

    setValidationError("");
    onSubmit({
      _id: patient._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      age: parsedAge,
      sex,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2b2a26]/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Үйлчлүүлэгчийн мэдээлэл засах"
        onClick={(event) => event.stopPropagation()}
        className={`${pageCardClass} max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[24px]`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-[#e8e3db] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#f0ece4] text-[#927f64]">
              <Pencil size={16} />
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              Үйлчлүүлэгчийн мэдээлэл засах
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Хаах"
            className="rounded-lg p-1.5 text-[#8d867b] transition hover:bg-[#f0ece4] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Овог
              <input
                autoFocus
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Нэр
              <input
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className={labelClass}>
            Регистрийн дугаар
            <input
              required
              maxLength={10}
              value={registrationNumber}
              onChange={(event) =>
                setRegistrationNumber(event.target.value.toUpperCase())
              }
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Нас
              <input
                type="number"
                min={1}
                max={130}
                required
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Хүйс
              <select
                value={sex}
                onChange={(event) => setSex(event.target.value)}
                className={inputClass}
              >
                <option value="MALE">Эрэгтэй</option>
                <option value="FEMALE">Эмэгтэй</option>
              </select>
            </label>
          </div>

          {(validationError || error) && (
            <p role="alert" className="text-sm text-rose-700">
              {validationError || error}
            </p>
          )}

          <div className="flex gap-3 border-t border-[#e8e3db] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`${secondaryButtonClass} flex-1`}
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${primaryButtonClass} flex-1`}
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
