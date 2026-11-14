import { useState } from "react";
import { Check, Search, UserPlus } from "lucide-react";
import { PageContainer, PageContent } from "../modules/app/ui/page";
import PatientHeader from "../modules/patient/components/PatientHeader";
import { PatientList } from "../modules/patient/components/PatientList";
import { PatientAddModal } from "../modules/patient/components/PatientModal";

export const PatientPage = () => {
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
      <PageContent className="pt-0 sm:pt-0 lg:pt-0">
        <div className="sticky top-0 z-30 -mx-5 bg-[#f7f6f3]/95 px-5 pb-4 pt-6 backdrop-blur-md sm:-mx-8 sm:px-8 sm:pt-8 lg:-mx-10 lg:px-10 lg:pt-6">
          <PatientHeader
            action={
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-stone-700 px-4 text-sm font-bold tracking-wide text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-500/25 active:scale-95 sm:w-auto sm:px-5"
              >
                <UserPlus size={15} />
                Үйлчлүүлэгч нэмэх
              </button>
            }
          />
          <label className="mt-5 flex h-12 items-center gap-2.5 rounded-xl border border-[#e8e3db] bg-white px-4 text-[#9c968d] transition focus-within:border-[#ad9272] focus-within:ring-4 focus-within:ring-[#ad9272]/10 sm:mt-4">
            <Search size={16} className="shrink-0" />
            <input
              type="text"
              aria-label="Үйлчлүүлэгч хайх"
              placeholder="Үйлчлүүлэгчийн нэр эсвэл регистрээр хайх..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full bg-transparent text-[13px] text-[#37342f] outline-none placeholder:text-[#b7b1a9]"
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

        {isAddModalOpen && (
          <PatientAddModal
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handlePatientAdded}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};