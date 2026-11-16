import type { ReactNode } from "react";
import { CircleUserRound } from "lucide-react";

type ProfileHeaderProps = {
  /** Гарчгийн доор гарах тайлбар (заавал биш) */
  description?: string;
  /** Баруун талд гарах badge эсвэл товч (заавал биш) */
  action?: ReactNode;
};

export const ProfileHeader = ({ description, action }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
          <CircleUserRound size={20} strokeWidth={1.6} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Ажилтны <span className="text-[#a48663]">мэдээлэл</span>
          </h1>
          {description && (
            <p className="mt-1 text-sm text-stone-500">{description}</p>
          )}
        </div>
      </div>

      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
    </div>
  );
};

export default ProfileHeader;