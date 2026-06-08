import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Calendar, X, AlertTriangle, ChevronDown, ChevronUp, Clock, CalendarDays } from "lucide-react";
import { APPOINTMENT_ADD } from "../graphql/mutation/appointmentAdd";
import { GET_PATIENTS } from "../graphql/query/patient";

interface AppointmentModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AppointmentModal = ({ patientId, onClose, onSuccess }: AppointmentModalProps) => {
  const [doctorName] = useState("Мөнхцэцэг");
  
  // Өнөөдрийн огноог YYYY-MM-DD хэлбэрээр анхны утга болгож авах
  const todayStr = new Date().toISOString().substring(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  const [selectedTime, setSelectedTime] = useState(""); // Жишээ нь: "09:20"
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const { data: patientsData } = useQuery(GET_PATIENTS, {
    variables: { page: 1, perPage: 100 },
  });

  const [addAppointment, { loading }] = useMutation(APPOINTMENT_ADD, {
    onCompleted: () => {
      alert("Цаг захиалга амжилттай товлогдлоо!");
      onSuccess();
    },
    onError: (err) => {
      alert("Алдаа гарлаа: " + err.message);
    }
  });

  // Эмчийн цаг давхцаж байгааг шалгах функц (24 цагаар)
  const checkTimeConflict = (timeStr: string) => {
    if (!patientsData?.patients?.list || !timeStr) return false;

    // Сонгосон огноо болон цагийг нийлүүлж ISO формат үүсгэх
    const checkStart = new Date(`${selectedDate}T${timeStr}:00`).getTime();
    const checkEnd = checkStart + 20 * 60 * 1000; // 20 минут нэмэх

    for (const patient of patientsData.patients.list) {
      if (!patient.appointments) continue;
      for (const app of patient.appointments) {
        if (app.status === "CANCELLED") continue;
        if (app.doctorName !== "Мөнхцэцэг") continue;

        const appStart = new Date(app.startTime).getTime();
        const appEnd = new Date(app.endTime).getTime();

        // Цаг давхцах нөхцөл
        if (checkStart < appEnd && checkEnd > appStart) {
          return true;
        }
      }
    }
    return false;
  };

  // 09:00 - 18:00 хүртэл 24 цагийн системээр слот үүсгэх
  const generateAvailableSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 20) {
        const timeString = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        const isBusy = checkTimeConflict(timeString);

        slots.push({
          time: timeString,
          isBusy,
        });
      }
    }
    return slots;
  };

  const selectTimeSlot = (time: string) => {
    setSelectedTime(time);
    setShowTimeSlots(false);
  };

  // Дуусах цагийг 24 цагийн форматаар тооцоолж харуулах (Жишээ нь: 09:20 -> 09:40)
  const getEndTimeDisplay = () => {
    if (!selectedTime) return "--:--";
    const [hour, min] = selectedTime.split(":").map(Number);
    let endMin = min + 20;
    let endHour = hour;
    if (endMin >= 60) {
      endMin -= 60;
      endHour += 1;
    }
    return `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      alert("Та үзлэгийн цагаа сонгоно уу.");
      return;
    }

    const startISO = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const [endHour, endMin] = getEndTimeDisplay().split(":");
    const endISO = new Date(`${selectedDate}T${endHour}:${endMin}:00`).toISOString();

    addAppointment({
      variables: {
        patientId,
        startTime: startISO,
        endTime: endISO,
        doctorName,
        status: "SCHEDULED",
        diagnosis: "",
      }
    });
  };

  const isCurrentTimeSlotBusy = checkTimeConflict(selectedTime);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Эмчид цаг товлох
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Сонгогдсон эмч */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Сонгогдсон эмч</label>
            <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
              Мөнхцэцэг эмч
            </div>
          </div>

          {/* ӨДӨР СОНГОХ ХЭСЭГ (Цэвэр огноо) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Үзлэгийн өдөр</label>
            <div className="relative">
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(""); // Өдөр солигдвол цагийг цэвэрлэнэ
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold text-gray-800"
              />
            </div>
          </div>

          {/* ЦАГ ХАРАХ ТОВЧЛУУР (TOGGLE BUTTON) */}
          <div>
            <button
              type="button"
              onClick={() => setShowTimeSlots(!showTimeSlots)}
              className="w-full flex items-center justify-between px-4 py-3 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{selectedDate}-ний боломжит цагуудыг харах</span>
              </div>
              {showTimeSlots ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* 24 ЦАГИЙН СИСТЕМТЭЙ ЦАГИЙН ЖАГСААЛТ */}
            {showTimeSlots && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {generateAvailableSlots().map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={slot.isBusy}
                    onClick={() => selectTimeSlot(slot.time)}
                    className={`py-2 text-xs font-bold rounded-lg text-center transition-all ${
                      slot.isBusy
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed line-through"
                        : slot.time === selectedTime
                        ? "bg-indigo-600 text-white border border-indigo-600"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 cursor-pointer shadow-sm"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* СОНГОГДСОН ЦАГИЙН БАТАЛГААЖУУЛАЛТ (АМ/РМ байхгүй) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Үзлэг эхлэх</label>
              <div className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold bg-gray-50 text-gray-800 flex items-center gap-2 ${
                isCurrentTimeSlotBusy ? "border-rose-500 bg-rose-50/30" : "border-gray-200"
              }`}>
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {selectedTime || "--:--"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Үзлэг дуусах</label>
              <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl text-sm font-bold flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {getEndTimeDisplay()}
              </div>
            </div>
          </div>

          {isCurrentTimeSlotBusy && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Мөнхцэцэг эмч энэ цагт өөр үзлэгтэй байна.</span>
            </div>
          )}

          {/* Үйлдэл хийх товчлуурууд */}
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={loading || isCurrentTimeSlotBusy || !selectedTime}
              className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors ${
                isCurrentTimeSlotBusy || !selectedTime ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Бүртгэж байна..." : "Цаг товлох"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};