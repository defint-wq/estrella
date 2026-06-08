import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { UserPlus, X } from "lucide-react";
import { PATIENT_ADD } from "../graphql/mutation/patientAdd";
import { GET_PATIENTS } from "../graphql/query/patient";
import { parseRegisterNumber } from "../../app/ui/registerParser";

interface PatientAddModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PatientAddModal = ({ onClose, onSuccess }: PatientAddModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [age, setAge] = useState<number>(0);
  const [sex, setSex] = useState("MALE");

  const [addPatient, { loading }] = useMutation(PATIENT_ADD, {
    refetchQueries: [
      {
        query: GET_PATIENTS,
        variables: { page: 1, perPage: 10 },
      },
    ],
    onCompleted: () => {
      alert("Үйлчлүүлэгч амжилттай бүртгэгдлээ!");
      onSuccess();
    },
    onError: (err) => {
      alert("Үйлчлүүлэгч бүртгэхэд алдаа гарлаа: " + err.message);
    },
  });

  // Регистр бичих бүрт ажиллаж, таны функцийг дуудах хэсэг
  const handleRegisterChange = (value: string) => {
    const uppercaseValue = value.toUpperCase();
    setRegistrationNumber(uppercaseValue);

    // Зөвхөн 10 тэмдэгт гүйцмэгц таны parseRegisterNumber функцийг ажиллуулна
    if (uppercaseValue.length === 10) {
      const result = parseRegisterNumber(uppercaseValue);
      if (result) {
        setAge(result.age); // Таны функцээс ирсэн насыг онооно
        setSex(result.sex); // Таны функцээс ирсэн хүйсийг онооно
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPatient({
      variables: {
        firstName,
        lastName,
        registrationNumber,
        age: Number(age),
        sex,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Шинэ үйлчлүүлэгч бүртгэх
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Овог</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Нэр</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Регистрийн дугаар</label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="Жишээ: АА12345678"
              value={registrationNumber}
              onChange={(e) => handleRegisterChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Нас</label>
              <input
                type="number"
                required
                readOnly
                value={age || ""}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Хүйс</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 border border-gray-200/60 rounded-xl">
                <button
                  type="button"
                  disabled
                  className={`py-1.5 text-sm font-bold rounded-lg transition-all ${
                    sex === "MALE"
                      ? "bg-white text-blue-600 shadow-sm border border-blue-50"
                      : "text-gray-300"
                  }`}
                >
                  Эр
                </button>
                <button
                  type="button"
                  disabled
                  className={`py-1.5 text-sm font-bold rounded-lg transition-all ${
                    sex === "FEMALE"
                      ? "bg-white text-pink-600 shadow-sm border border-pink-50"
                      : "text-gray-300"
                  }`}
                >
                  Эм
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? "Бүртгэж байна..." : "Бүртгэх"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};