import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  AlertTriangle, CalendarDays, ChevronDown, ChevronUp, Clock, Stethoscope, X,
} from "lucide-react";
import { APPOINTMENT_ADD } from "../graphql/mutation/appointmentAdd";
import { GET_PATIENTS } from "../graphql/query/patient";
import { GET_DOCTORS } from "../graphql/query/doctors";
import {
  pageCardClass,
  pageInputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../app/ui/page";

interface AppointmentModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SLOT_MINUTES = 20;

// toISOString() нь UTC огноо өгдөг тул өглөө эрт өчигдрийг харуулдаг байсан.
// Локал огноог гараар үүсгэнэ.
const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9b8a73]";

export const AppointmentModal = ({ patientId, onClose, onSuccess }: AppointmentModalProps) => {
  const todayStr = toLocalDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: patientsData } = useQuery(GET_PATIENTS, {
    variables: { page: 1, perPage: 100 },
  });
  const { data: doctorsData } = useQuery<{
    employees: { _id: string; name: string }[];
  }>(GET_DOCTORS, {
    variables: { role: "DOCTOR" },
  });
  const doctors: { _id: string; name: string }[] =
    doctorsData?.employees ?? [];
  const selectedDoctor = doctors.find((doctor) => doctor._id === doctorId);

  const [addAppointment, { loading }] = useMutation(APPOINTMENT_ADD, {
    onCompleted: () => onSuccess(),
    onError: (err) => setErrorMsg("Алдаа гарлаа: " + err.message),
  });

  // Esc дарахад хаах
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Сонгосон эмчийн цагтай давхцаж байгааг шалгах
  const checkTimeConflict = (timeStr: string) => {
    const list = patientsData?.patients?.list;
    if (!list || !timeStr) return false;

    const checkStart = new Date(`${selectedDate}T${timeStr}:00`).getTime();
    const checkEnd = checkStart + SLOT_MINUTES * 60 * 1000;

    for (const patient of list) {
      if (!patient.appointments) continue;
      for (const app of patient.appointments) {
        if (app.status === "CANCELLED") continue;
        if (
          app.doctorId
            ? app.doctorId !== doctorId
            : app.doctorName !== selectedDoctor?.name
        ) continue;

        const appStart = new Date(app.startTime).getTime();
        const appEnd = new Date(app.endTime).getTime();
        if (checkStart < appEnd && checkEnd > appStart) return true;
      }
    }
    return false;
  };

  // 09:00 - 18:00, 20 минут тутамд. Өнгөрсөн цагийг мөн хаана.
  const slots = useMemo(() => {
    const result: { time: string; isBusy: boolean }[] = [];
    const now = Date.now();
    for (let hour = 9; hour < 18; hour++) {
      for (let min = 0; min < 60; min += SLOT_MINUTES) {
        const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        const isPast = new Date(`${selectedDate}T${time}:00`).getTime() < now;
        result.push({ time, isBusy: isPast || checkTimeConflict(time) });
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, patientsData, doctorId, selectedDoctor?.name]);

  const getEndTimeDisplay = () => {
    if (!selectedTime) return "--:--";
    const [hour, min] = selectedTime.split(":").map(Number);
    const total = hour * 60 + min + SLOT_MINUTES;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const isCurrentTimeSlotBusy = checkTimeConflict(selectedTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!selectedTime) {
      setErrorMsg("Та үзлэгийн цагаа сонгоно уу.");
      return;
    }

    const startISO = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const endISO = new Date(`${selectedDate}T${getEndTimeDisplay()}:00`).toISOString();

    addAppointment({
      variables: {
        patientId,
        startTime: startISO,
        endTime: endISO,
        doctorId,
        diagnosis: "",
      },
    });
  };

  const canSubmit =
    !loading && !!doctorId && !!selectedTime && !isCurrentTimeSlotBusy;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2b2a26]/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Эмчид цаг товлох"
        onClick={(e) => e.stopPropagation()}
        className={`${pageCardClass} max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[24px]`}
      >
        {/* Гарчиг */}
        <div className="mb-5 flex items-center justify-between border-b border-[#f0ede8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#f5f2ed] text-[#927f64]">
              <CalendarDays size={17} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">
                Эмчид цаг товлох
              </h3>
              <p className="mt-0.5 text-[10px] text-[#9b968d]">Үзлэг тус бүр {SLOT_MINUTES} минут</p>
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
          {/* Эмч */}
          <div>
            <label htmlFor="appointment-doctor" className={labelClass}>Эмч сонгох</label>
            <div className="flex items-center gap-2.5">
              <Stethoscope size={15} className="shrink-0 text-[#a48663]" />
              <select
                id="appointment-doctor"
                required
                value={doctorId}
                onChange={(event) => {
                  setDoctorId(event.target.value);
                  setSelectedTime("");
                }}
                className={pageInputClass}
              >
                <option value="">Эмч сонгоно уу</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Өдөр */}
          <div>
            <label htmlFor="appt-date" className={labelClass}>Үзлэгийн өдөр</label>
            <input
              id="appt-date"
              type="date"
              required
              min={todayStr}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
                setErrorMsg("");
              }}
              className={pageInputClass}
            />
          </div>

          {/* Цагийн слот */}
          <div>
            <span className={labelClass}>Боломжит цаг</span>
            <button
              type="button"
              onClick={() => setShowTimeSlots((v) => !v)}
              aria-expanded={showTimeSlots}
              className="flex w-full items-center justify-between rounded-xl border border-stone-200 bg-[#FAF8F5] px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              <span className="flex items-center gap-2">
                <Clock size={15} className="text-[#a48663]" />
                {selectedTime ? `Сонгосон цаг: ${selectedTime}` : "Цагаа сонгох"}
              </span>
              {showTimeSlots ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showTimeSlots && (
              <div className="mt-2 grid max-h-52 grid-cols-4 gap-2 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-3">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={slot.isBusy || !doctorId}
                    onClick={() => {
                      setSelectedTime(slot.time);
                      setShowTimeSlots(false);
                      setErrorMsg("");
                    }}
                    className={`rounded-lg py-2 text-center text-[11px] font-medium transition ${
                      slot.isBusy
                        ? "cursor-not-allowed bg-[#f1eee9] text-[#bdb7ae] line-through"
                        : slot.time === selectedTime
                        ? "bg-stone-900 text-white shadow-sm"
                        : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Эхлэх / дуусах */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={labelClass}>Үзлэг эхлэх</span>
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-stone-900 ${
                  isCurrentTimeSlotBusy ? "border-rose-300 bg-rose-50/50" : "border-stone-200 bg-[#FAF8F5]"
                }`}
              >
                <Clock size={14} className="text-[#a8a197]" />
                {selectedTime || "--:--"}
              </div>
            </div>
            <div>
              <span className={labelClass}>Үзлэг дуусах</span>
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-500">
                <Clock size={14} className="text-[#a8a197]" />
                {getEndTimeDisplay()}
              </div>
            </div>
          </div>

          {isCurrentTimeSlotBusy && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[11px] font-medium text-rose-700">
              <AlertTriangle size={15} className="shrink-0" />
              {selectedDoctor?.name} эмч энэ цагт өөр үзлэгтэй байна.
            </div>
          )}
          {errorMsg && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[11px] font-medium text-rose-700">
              {errorMsg}
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
              {loading ? "Бүртгэж байна..." : "Цаг товлох"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};