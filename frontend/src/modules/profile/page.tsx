import { useState, type FormEvent } from "react";
import {
  PageContainer,
  PageContent,
  pageCardClass,
} from "../app/ui/page";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileForm } from "./components/ProfileForm";
import type { ProfileFormValues } from "./profileTypes";
import { useProfile } from "./hooks/useProfile";

export const ProfilePage = () => {
  const [editedForm, setEditedForm] = useState<Partial<ProfileFormValues>>({});
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const {
    employee,
    loading,
    saving,
    queryError,
    updateProfile,
  } = useProfile({
    onSaved: (updatedEmployee) => {
      setEditedForm({
        firstName: updatedEmployee.firstName,
        lastName: updatedEmployee.lastName,
        phone: updatedEmployee.phone,
        password: "",
        avatar: updatedEmployee.avatar ?? "",
      });
      setFormError("");
      setNotice("Мэдээлэл амжилттай хадгалагдлаа.");
    },
  });
  const form: ProfileFormValues = {
    firstName: editedForm.firstName ?? employee?.firstName ?? "",
    lastName: editedForm.lastName ?? employee?.lastName ?? "",
    phone: editedForm.phone ?? employee?.phone ?? "",
    password: editedForm.password ?? "",
    avatar: editedForm.avatar ?? employee?.avatar ?? "",
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setFormError("");
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setFormError("Овог, нэр болон утасны дугаараа бөглөнө үү.");
      return;
    }
    if (
      form.password &&
      (form.password.length < 12 ||
        new TextEncoder().encode(form.password).byteLength > 72)
    ) {
      setFormError("Нууц үг 12-оос доошгүй тэмдэгт, 72 UTF-8 байтаас ихгүй байна.");
      return;
    }

    setNotice("");
    void updateProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      password: form.password || null,
      avatar: form.avatar.trim() || null,
    }).catch((cause: unknown) => {
      setFormError(
        cause instanceof Error ? cause.message : "Мэдээлэл хадгалж чадсангүй.",
      );
    });
  };

  const handleChange = (field: keyof ProfileFormValues, value: string) => {
    setEditedForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <PageContainer>
      <PageContent>
        <ProfileHeader
          description="Өөрийн бүртгэлтэй мэдээллийг харах, шинэчлэх."
          action={
            employee ? (
              <span className="inline-flex w-fit rounded-full bg-stone-100 px-3.5 py-1.5 text-xs font-semibold text-stone-700">
                {employee.role}
              </span>
            ) : undefined
          }
        />

        {loading && (
          <p role="status" className="text-sm text-stone-500">
            Уншиж байна...
          </p>
        )}
        {queryError && (
          <p
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            {queryError.message}
          </p>
        )}
        {employee && (
          <>
            <section
              className={`${pageCardClass} flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8`}
            >
              <div className="flex min-w-0 items-center gap-4">
                {employee.avatar ? (
                  <img
                    src={employee.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-14 shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-lg font-semibold text-stone-700">
                    {`${employee.lastName?.[0] ?? ""}${employee.firstName?.[0] ?? ""}` ||
                      employee.name.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
                    {`${employee.lastName} ${employee.firstName}`.trim() ||
                      employee.name}
                  </h2>
                  <p className="mt-1 truncate text-sm text-stone-500">
                    {employee.username}
                  </p>
                </div>
              </div>
            </section>

            <ProfileForm
              employee={employee}
              values={form}
              saving={saving}
              error={formError}
              notice={notice}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </PageContent>
    </PageContainer>
  );
};