import type { FormEvent } from "react";
import {
  pageCardClass,
  pageInputClass,
  primaryButtonClass,
} from "../../app/ui/page";
import { ProfileAvatar } from "./ProfileAvatar";
import type { EmployeeProfile, ProfileFormValues } from "../profileTypes";

interface ProfileFormProps {
  employee: EmployeeProfile;
  values: ProfileFormValues;
  saving: boolean;
  error: string;
  notice: string;
  onChange: (field: keyof ProfileFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const labelClass = "block text-sm font-medium text-stone-700";

export const ProfileForm = ({
  employee,
  values,
  saving,
  error,
  notice,
  onChange,
  onSubmit,
}: ProfileFormProps) => (
  <form onSubmit={onSubmit} className={`${pageCardClass} overflow-hidden`}>
    <section className="space-y-6 p-6 sm:p-8">
      <div>
        <h2 className="text-base font-semibold text-stone-900">
          Хувийн мэдээлэл
        </h2>
        <p className="mt-1 text-sm leading-6 text-stone-500">
          Өөрчлөх боломжтой мэдээллээ шинэчлээд хадгална уу.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Овог
          <input
            autoComplete="family-name"
            value={values.lastName}
            onChange={(event) => onChange("lastName", event.currentTarget.value)}
            required
            className={`${pageInputClass} mt-2`}
          />
        </label>
        <label className={labelClass}>
          Нэр
          <input
            autoComplete="given-name"
            value={values.firstName}
            onChange={(event) =>
              onChange("firstName", event.currentTarget.value)
            }
            required
            className={`${pageInputClass} mt-2`}
          />
        </label>
        <label className={labelClass}>
          Утас
          <input
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => onChange("phone", event.currentTarget.value)}
            required
            className={`${pageInputClass} mt-2`}
          />
        </label>
        <div className="sm:col-span-2">
          <ProfileAvatar
            value={values.avatar}
            onChange={(avatar) => onChange("avatar", avatar)}
            disabled={saving}
          />
        </div>
        <label className={labelClass}>
          Нас
          <input
            value={employee.age}
            readOnly
            className={`${pageInputClass} mt-2 read-only:bg-stone-100`}
          />
        </label>
        <label className={labelClass}>
          Хүйс
          <input
            value={employee.gender === "MALE" ? "Эрэгтэй" : "Эмэгтэй"}
            readOnly
            className={`${pageInputClass} mt-2 read-only:bg-stone-100`}
          />
        </label>
        <label className={labelClass}>
          Регистрийн дугаар
          <input
            value={employee.registerNumber}
            readOnly
            className={`${pageInputClass} mt-2 read-only:bg-stone-100`}
          />
        </label>
        <label className={labelClass}>
          Нэвтрэх нэр
          <input
            value={employee.username}
            readOnly
            className={`${pageInputClass} mt-2 read-only:bg-stone-100`}
          />
        </label>
      </div>
    </section>

    <section className="space-y-5 border-t border-stone-200 bg-[#FAF8F5] p-6 sm:p-8">
      <div>
        <h2 className="text-base font-semibold text-stone-900">
          Нууц үг солих
        </h2>
        <p className="mt-1 text-sm leading-6 text-stone-500">
          Өөрчлөхгүй бол энэ талбарыг хоосон үлдээнэ үү.
        </p>
      </div>
      <label className={`${labelClass} max-w-xl`}>
        Шинэ нууц үг
        <input
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => onChange("password", event.currentTarget.value)}
          className={`${pageInputClass} mt-2`}
        />
      </label>
    </section>

    <div className="flex flex-col gap-3 border-t border-stone-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div aria-live="polite">
        {error && (
          <p role="alert" className="text-sm text-rose-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-emerald-700">
            {notice}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={saving}
        className={`${primaryButtonClass} h-11 px-6`}
      >
        {saving ? "Хадгалж байна..." : "Хадгалах"}
      </button>
    </div>
  </form>
);
