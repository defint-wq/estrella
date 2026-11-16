import { useState, type FormEvent } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  PageContainer,
  PageContent,
  PageTitle,
  pageCardClass,
  pageInputClass,
  primaryButtonClass,
} from "../../modules/app/ui/page";
import { AvatarInput } from "../../modules/app/ui/AvatarInput";

const ME_PROFILE = gql`
  query MeProfile {
    me {
      _id
      name
      firstName
      lastName
      age
      gender
      avatar
      phone
      registerNumber
      username
      role
    }
  }
`;

const UPDATE_EMPLOYEE_PROFILE = gql`
  mutation UpdateMyProfile(
    $firstName: String
    $lastName: String
    $phone: String
    $password: String
    $avatar: String
  ) {
    updateMyProfile(
      firstName: $firstName
      lastName: $lastName
      phone: $phone
      password: $password
      avatar: $avatar
    ) {
      _id
      name
      firstName
      lastName
      age
      gender
      avatar
      phone
      registerNumber
      username
      role
    }
  }
`;

type EmployeeProfile = {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: "MALE" | "FEMALE";
  avatar?: string | null;
  phone: string;
  registerNumber: string;
  username: string;
  role: "ADMIN" | "RECEPTION" | "DOCTOR";
};

type ProfileForm = Pick<
  EmployeeProfile,
  "firstName" | "lastName" | "phone"
> & { password: string; avatar: string };
type ProfileUpdateVariables = Omit<ProfileForm, "password" | "avatar"> & {
  password: string | null;
  avatar: string | null;
};

const labelClass = "block text-sm font-medium text-stone-700";

export const ProfilePage = () => {
  const { data, loading, error } = useQuery<{ me: EmployeeProfile }>(
    ME_PROFILE,
    { fetchPolicy: "no-cache" },
  );
  const [editedForm, setEditedForm] = useState<Partial<ProfileForm>>({});
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const employee = data?.me;
  const form: ProfileForm = {
    firstName: editedForm.firstName ?? employee?.firstName ?? "",
    lastName: editedForm.lastName ?? employee?.lastName ?? "",
    phone: editedForm.phone ?? employee?.phone ?? "",
    password: editedForm.password ?? "",
    avatar: editedForm.avatar ?? employee?.avatar ?? "",
  };

  const [updateProfile, { loading: saving }] = useMutation<
    { updateMyProfile: EmployeeProfile },
    ProfileUpdateVariables
  >(UPDATE_EMPLOYEE_PROFILE, {
    onCompleted: ({ updateMyProfile: employee }) => {
      setEditedForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        password: "",
        avatar: employee.avatar ?? "",
      });
      setFormError("");
      setNotice("Мэдээлэл амжилттай хадгалагдлаа.");
    },
    onError: (cause) => {
      setNotice("");
      setFormError(cause.message);
    },
  });

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

    updateProfile({
      variables: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        password: form.password || null,
        avatar: form.avatar.trim() || null,
      },
    });
  };

  return (
    <PageContainer>
      <PageContent>
          <PageTitle
            title="Ажилтны мэдээлэл"
            description="Өөрийн бүртгэлтэй мэдээллийг харах, шинэчлэх."
          />
          {loading && (
            <p role="status" className="text-sm text-stone-500">
              Уншиж байна...
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error.message}
            </p>
          )}
        {employee && (
          <>
            <section className={`${pageCardClass} flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8`}>
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
              <span className="w-fit rounded-full bg-stone-100 px-3.5 py-1.5 text-xs font-semibold text-stone-700">
                {employee.role}
              </span>
            </section>

            <form
              onSubmit={handleSubmit}
              className={`${pageCardClass} overflow-hidden`}
            >
              <section className="p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-base font-semibold tracking-tight text-stone-900">
                    Хувийн мэдээлэл
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Өөрчлөх боломжтой мэдээллээ шинэчлээд хадгална уу.
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className={labelClass}>
                    Овог
                    <input
                      autoComplete="family-name"
                      value={form.lastName}
                      onChange={(event) =>
                        setEditedForm({
                          ...editedForm,
                          lastName: event.currentTarget.value,
                        })
                      }
                      required
                      className={`${pageInputClass} mt-2 read-only:bg-stone-100`}
                    />
                  </label>
                  <label className={labelClass}>
                    Нэр
                    <input
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={(event) =>
                        setEditedForm({
                          ...editedForm,
                          firstName: event.currentTarget.value,
                        })
                      }
                      required
                      className={`${pageInputClass} mt-2 read-only:bg-stone-100`}
                    />
                  </label>
                  <label className={labelClass}>
                    Утас
                    <input
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setEditedForm({
                          ...editedForm,
                          phone: event.currentTarget.value,
                        })
                      }
                      required
                      className={`${pageInputClass} mt-2 read-only:bg-stone-100`}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <AvatarInput
                      value={form.avatar}
                      onChange={(avatar) =>
                        setEditedForm({ ...editedForm, avatar })
                      }
                      disabled={saving}
                    />
                  </div>
                  <label className={labelClass}>
                    Нас
                    <input value={employee.age} readOnly className={`${pageInputClass} mt-2 read-only:bg-stone-100`} />
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
                <div className="mb-5">
                  <h3 className="text-base font-semibold tracking-tight text-stone-900">
                    Нууц үг солих
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Өөрчлөхгүй бол энэ талбарыг хоосон үлдээнэ үү.
                  </p>
                </div>
                <label                 className={`${labelClass} max-w-xl`}>
                  Шинэ нууц үг
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) =>
                      setEditedForm({
                        ...editedForm,
                        password: event.currentTarget.value,
                      })
                    }
                    className={`${pageInputClass} mt-2`}
                  />
                </label>
              </section>

              <div className="flex flex-col gap-3 border-t border-stone-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div aria-live="polite">
                  {formError && (
                    <p role="alert" className="text-sm text-rose-700">
                      {formError}
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
          </>
        )}
      </PageContent>
    </PageContainer>
  );
};
