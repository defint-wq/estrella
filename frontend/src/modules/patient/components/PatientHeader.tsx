import React from "react";
import { Users } from "lucide-react"; // Эмнэлгийн үйлчлүүлэгчдэд тохирох икон

export const PatientHeader = () => {
  return (
    <div className="flex flex-col items-start gap-1 mb-8 md:mb-10">
      {/* Гарчиг болон Икон */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
          <Users className="text-indigo-600 w-7 h-7 md:w-8 md:h-8" />
          Үйлчлүүлэгчдийн <span className="text-indigo-600">жагсаалт</span>
        </h1>
      </div>

      {/* Танилцуулга текст */}
      <p className="text-gray-500 text-xs md:text-sm font-medium mt-1 max-w-2xl leading-relaxed">
        Системд бүртгэлтэй нийт үйлчлүүлэгчдийн мэдээлэл, үзлэгийн явц болон цаг захиалга.
      </p>
    </div>
  );
};

export default PatientHeader;