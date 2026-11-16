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
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
          <Users size={20} strokeWidth={1.6} />
        </div>

        <div>
          <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xl font-bold text-stone-900">
            <span>
              Үйлчлүүлэгчдийн <span className="text-[#a48663]">жагсаалт</span>
            </span>
            {typeof count === "number" && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold tracking-normal text-stone-600">
                {count}
              </span>
            )}
          </h1>
        </div>
      </div>

      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
    </div>
  );
};

export default PatientHeader;