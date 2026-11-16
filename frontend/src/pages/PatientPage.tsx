import { useState } from "react";
import { Check, Search, UserPlus } from "lucide-react";
import {
  PageContainer,
  PageContent,
  primaryButtonClass,
} from "../modules/app/ui/page";
import PatientHeader from "../modules/patient/components/PatientHeader";
import { PatientList } from "../modules/patient/components/PatientList";
import { PatientAddModal } from "../modules/patient/components/PatientModal";
import { useAuth } from "../modules/auth/AuthContext";

export const PatientPage = () => {
  const { user } = useAuth();
  const canManagePatients =
    user?.role === "ADMIN" || user?.role === "RECEPTION";
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const handlePatientAdded = () => {
    setIsAddModalOpen(false);
    setNotice("Үйлчлүүлэгч амжилттай бүртгэгдлээ.");
    window.setTimeout(() => setNotice(""), 3200);
  };

  return (
    <PageContainer>
      <PageContent>
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/95 pb-4 pt-2 backdrop-blur-md">
          <PatientHeader
            action={canManagePatients ? (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
              className={`${primaryButtonClass} h-11 w-full whitespace-nowrap sm:w-auto`}
              >
                <UserPlus size={15} />
                Үйлчлүүлэгч нэмэх
              </button>
            ) : undefined}
          />
          <label className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] px-4 text-stone-500 transition focus-within:ring-2 focus-within:ring-stone-900">
            <Search size={16} className="shrink-0" />
            <input
              type="text"
              aria-label="Үйлчлүүлэгч хайх"
              placeholder="Үйлчлүүлэгчийн нэр эсвэл регистрээр хайх..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:ring-0"
            />
          </label>
        </div>

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl border border-[#dce6da] bg-[#f3f7f1] px-4 py-3 text-[12px] text-[#597052]"
          >
            <Check size={15} /> {notice}
          </div>
        )}

        <PatientList searchQuery={searchQuery} />

        {isAddModalOpen && canManagePatients && (
          <PatientAddModal
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handlePatientAdded}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};