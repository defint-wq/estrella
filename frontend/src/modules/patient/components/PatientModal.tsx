import { useEffect, useState } from "react";
import { AlertTriangle, UserPlus, X } from "lucide-react";
import { parseRegisterNumber } from "../../app/ui/registerParser";
import type { PatientAddVariables } from "../types/patient";
import {
  pageCardClass,
  pageInputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../app/ui/page";

interface PatientAddModalProps {
  onClose: () => void;
  onSubmit: (values: PatientAddVariables) => void;
  loading: boolean;
  error?: string;
}

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9b8a73]";

const inputClass = pageInputClass;

export const PatientAddModal = ({
  onClose,
  onSubmit,
  loading,
  error,
}: PatientAddModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [age, setAge] = useState<number>(0);
  const [sex, setSex] = useState("MALE");
  const [registerInvalid, setRegisterInvalid] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Esc дарахад хаах
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleRegisterChange = (value: string) => {
    const upper = value.toUpperCase();
    setRegistrationNumber(upper);
    setValidationError("");

    if (upper.length === 10) {
      const result = parseRegisterNumber(upper);
      if (result) {
        setAge(result.age);
        setSex(result.sex);
        setRegisterInvalid(false);
      } else {
        setAge(0);
        setRegisterInvalid(true);
      }
    } else {
      // Дугаар засагдаж байхад хуучин нас, хүйс үлдэхгүй
      setAge(0);
      setRegisterInvalid(false);
    }
  };

  const canSubmit =
    !loading && age > 0 && firstName.trim() !== "" && lastName.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setValidationError("");
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      registrationNumber,
      age: Number(age),
      sex,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2b2a26]/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Шинэ үйлчлүүлэгч бүртгэх"
        onClick={(e) => e.stopPropagation()}
        className={`${pageCardClass} max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[24px]`}
      >
        {/* Гарчиг */}
        <div className="mb-5 flex items-center justify-between border-b border-[#f0ede8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#f5f2ed] text-[#927f64]">
              <UserPlus size={17} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">
                Шинэ үйлчлүүлэгч бүртгэх
              </h3>
              <p className="mt-0.5 text-[10px] text-[#9b968d]">
                Нас, хүйс регистрээс автоматаар тодорно
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Хаах"
            className="rounded-lg p-1.5 text-[#aaa49b] transition hover:bg-[#f4f1ec] hover:text-[#554c3e]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="patient-last" className={labelClass}>Овог</label>
              <input
                id="patient-last"
                type="text"
                required
                autoFocus
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="patient-first" className={labelClass}>Нэр</label>
              <input
                id="patient-first"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="patient-reg" className={labelClass}>Регистрийн дугаар</label>
            <input
              id="patient-reg"
              type="text"
              required
              maxLength={10}
              placeholder="Жишээ: АА12345678"
              value={registrationNumber}
              onChange={(e) => handleRegisterChange(e.target.value)}
              className={`${inputClass} uppercase tracking-wide ${
                registerInvalid ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-200/50" : ""
              }`}
            />
            {registerInvalid && (
              <p role="alert" className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-rose-700">
                <AlertTriangle size={13} /> Регистрийн дугаар буруу байна.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={labelClass}>Нас</span>
              <div className="flex h-11 items-center rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-semibold text-stone-700">
                {age > 0 ? age : <span className="font-normal text-[#b7b1a9]">—</span>}
              </div>
            </div>

            <div>
              <span className={labelClass}>Хүйс</span>
              <div className="grid h-11 grid-cols-2 gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
                {[
                  { value: "MALE", label: "Эр" },
                  { value: "FEMALE", label: "Эм" },
                ].map((opt) => {
                  const selected = age > 0 && sex === opt.value;
                  return (
                    <div
                      key={opt.value}
                      aria-label={opt.label}
                      aria-current={selected}
                      className={`flex items-center justify-center rounded-lg text-[12px] font-medium transition ${
                        selected
                          ? "rounded-lg bg-white text-stone-900 shadow-sm"
                          : "rounded-lg text-stone-400"
                      }`}
                    >
                      {opt.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {(validationError || error) && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[11px] font-medium text-rose-700">
              {validationError || error}
            </div>
          )}

          {/* Үйлдэл */}
          <div className="flex gap-3 border-t border-[#f0ede8] pt-5">
            <button
              type="button"
              onClick={onClose}
              className={`${secondaryButtonClass} flex-1`}
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`${primaryButtonClass} flex-1`}
            >
              {loading ? "Бүртгэж байна..." : "Бүртгэх"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};