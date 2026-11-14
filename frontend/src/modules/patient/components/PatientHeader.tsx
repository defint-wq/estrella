import type { ReactNode } from "react";
import { Users } from "lucide-react";

type PatientHeaderProps = {
  /** Нийт үйлчлүүлэгчийн тоо (заавал биш) */
  count?: number;
  /** Баруун талд гарах товч, жишээ нь "Шинэ үйлчлүүлэгч" (заавал биш) */
  action?: ReactNode;
};

export const PatientHeader = ({ count, action }: PatientHeaderProps) => {
  return (
    <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="flex items-start gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#353a33] text-[#eee8dc] shadow-sm">
          <Users size={20} strokeWidth={1.6} />
        </div>

        <div>
          <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[25px] font-medium tracking-[-0.04em] text-[#36342f] sm:text-[30px]">
            <span>
              Үйлчлүүлэгчдийн <span className="text-[#a48663]">жагсаалт</span>
            </span>
            {typeof count === "number" && (
              <span className="rounded-md bg-[#f4f1ec] px-2 py-0.5 text-xs font-medium tracking-normal text-[#8b8173]">
                {count}
              </span>
            )}
          </h1>
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PatientHeader;