import { useState } from "react";
import { PageContainer } from "../modules/app/ui/page";
import PatientHeader from "../modules/patient/components/PatientHeader";
import { PatientList } from "../modules/patient/components/PatientList";
import { UserPlus, Search } from "lucide-react";
import { PatientAddModal } from "../modules/patient/components/PatientModal";

export const PatientPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page] = useState(1);
  const [perPage] = useState(10);
  
  // Модал удирдах болон жагсаалтыг шинэчлэх (Refetch) state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0); 

  const handlePatientAdded = () => {
    setIsAddModalOpen(false);
    setRefetchKey((prev) => prev + 1); // Жагсаалтыг автоматаар шинэчлэх триггер
  };

  return (
    <PageContainer>
      <PatientHeader />
      
      {/* ХАЙЛТ БОЛОН ҮЙЛЧЛҮҮЛЭГЧ НЭМЭХ ХЭСЭГ */}
      <div className="mb-6 flex gap-3 items-center">
        {/* Хайлтын талбар */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Үйлчлүүлэгчийн нэр эсвэл регисрээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
          />
        </div>

        {/* НЭМЭХ ТОВЧЛУУР (Хайлтын хажууд) */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Үйлчлүүлэгч нэмэх</span>
        </button>
      </div>

      {/* ЖАГСААЛТ */}
      <PatientList 
        key={refetchKey} // Шинэ хүн нэмэгдэхэд жагсаалтыг дахин уншина
        searchQuery={searchQuery} 
        page={page} 
        perPage={perPage} 
      />

      {/* БҮРТГЭХ МОДАЛ */}
      {isAddModalOpen && (
        <PatientAddModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handlePatientAdded}
        />
      )}
    </PageContainer>
  );
};