import { useRef, useState, type FormEvent } from "react";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
import {
  PageContainer,
  PageContent,
  PageTitle,
  dangerButtonClass,
  pageCardClass,
  pageInputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../app/ui/page";
import { parseEmployeeRegisterNumber } from "../app/ui/registerParser";
import { useAuth } from "../auth/AuthContext";
import { AvatarInput } from "../app/ui/AvatarInput";
import { useEmployees } from "./hooks/useEmployees";
import type {
  CreateEmployeeVariables,
  EmployeeRecord,
  UpdateEmployeeVariables,
} from "./types/employee";

const inputClass = pageInputClass;

export const AdminDashboard = () => {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    employees,
    loading,
    error,
    creating: saving,
    createError,
    createEmployee,
    updating,
    updateError,
    updateEmployee,
    deleting,
    deleteError,
    deleteEmployee,
  } = useEmployees();
  const [registerNumber, setRegisterNumber] = useState("");
  const [registration, setRegistration] = useState<ReturnType<
    typeof parseEmployeeRegisterNumber
  >>(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(
    null,
  );
  const [editingRegisterNumber, setEditingRegisterNumber] = useState("");
  const [editingRegistration, setEditingRegistration] = useState<ReturnType<
    typeof parseEmployeeRegisterNumber
  >>(null);
  const [editingAvatar, setEditingAvatar] = useState("");
  const operationError =
    formError ||
    createError?.message ||
    updateError?.message ||
    deleteError?.message;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsedRegistration = parseEmployeeRegisterNumber(registerNumber);
    const password = String(formData.get("password") ?? "");
    if (password.length < 12) {
      setFormError("Нууц үг дор хаяж 12 тэмдэгт байх шаардлагатай.");
      return;
    }
    if (new TextEncoder().encode(password).byteLength > 72) {
      setFormError("Нууц үг 72 UTF-8 байтаас хэтрэхгүй байх шаардлагатай.");
      return;
    }
    if (!parsedRegistration) {
      setFormError("Регистрийн дугаар буруу байна. Дахин шалгана уу.");
      return;
    }
    setNotice("");
    setFormError("");
    const variables: CreateEmployeeVariables = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      registerNumber: parsedRegistration.registerNumber,
      username: String(formData.get("username") ?? "").trim(),
      password,
      role: formData.get("role") === "RECEPTION" ? "RECEPTION" : "DOCTOR",
    };
    void createEmployee(variables).then(
      () => {
        setNotice("Ажилтны бүртгэл амжилттай үүслээ.");
        setFormError("");
        setRegisterNumber("");
        setRegistration(null);
        formRef.current?.reset();
      },
      (cause: unknown) => setFormError(getErrorMessage(cause)),
    );
  };

  const handleUpdateEmployee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEmployee) return;
    const formData = new FormData(event.currentTarget);
    const parsedRegistration = parseEmployeeRegisterNumber(
      editingRegisterNumber,
    );
    if (!parsedRegistration) {
      setFormError("Регистрийн дугаар буруу байна. Дахин шалгана уу.");
      return;
    }
    setNotice("");
    setFormError("");
    const variables: UpdateEmployeeVariables = {
      _id: editingEmployee._id,
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      username: String(formData.get("username") ?? "").trim(),
      registerNumber: parsedRegistration.registerNumber,
      avatar: editingAvatar.trim() || null,
      role: formData.get("role") === "RECEPTION" ? "RECEPTION" : "DOCTOR",
    };
    void updateEmployee(variables).then(
      () => {
        setEditingEmployee(null);
        setNotice("Ажилтны мэдээлэл шинэчлэгдлээ.");
        setFormError("");
      },
      (cause: unknown) => setFormError(getErrorMessage(cause)),
    );
  };

  const handleDeleteEmployee = (employee: EmployeeRecord) => {
    if (employee._id === user?._id) {
      setFormError("Та өөрийн идэвхтэй бүртгэлийг устгах боломжгүй.");
      return;
    }
    const employeeName =
      `${employee.lastName} ${employee.firstName}`.trim() || employee.name;
    if (
      !window.confirm(
        `${employeeName}-ийн бүртгэл болон нэвтрэх эрхийг устгах уу?`,
      )
    ) {
      return;
    }
    setNotice("");
    setFormError("");
    void deleteEmployee(employee._id).then(
      () => {
        setNotice("Ажилтны бүртгэл устгагдлаа.");
        setFormError("");
      },
      (cause: unknown) => setFormError(getErrorMessage(cause)),
    );
  };

  return (
    <PageContainer>
      <PageContent>
        <PageTitle title="Ажилтны эрх ба бүртгэл" />
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`${pageCardClass} grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3`}
        >
          <label className="text-xs font-semibold text-[#6c6255]">
            Овог
            <input name="lastName" required className={inputClass} />
          </label>
          <label className="text-xs font-semibold text-[#6c6255]">
            Нэр
            <input name="firstName" required className={inputClass} />
          </label>
          <label className="text-xs font-semibold text-[#6c6255]">
            Нас (регистрээс)
            <input value={registration?.age ?? ""} readOnly className={inputClass} />
          </label>
          <label className="text-xs font-semibold text-[#6c6255]">
            Хүйс (регистрээс)
            <input
              value={
                registration?.gender === "MALE"
                  ? "Эрэгтэй"
                  : registration?.gender === "FEMALE"
                    ? "Эмэгтэй"
                    : ""
              }
              readOnly
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold text-[#6c6255]">
            Утас
            <input name="phone" required className={inputClass} />
          </label>
          <label className="text-xs font-semibold text-[#6c6255]">
            Регистрийн дугаар
            <input
              name="registerNumber"
              value={registerNumber}
              onChange={(event) => {
                const value = event.currentTarget.value.toUpperCase();
                setRegisterNumber(value);
                setRegistration(parseEmployeeRegisterNumber(value));
              }}
              required
              maxLength={10}
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold text-[#6c6255]">
            Нэвтрэх нэр
            <input name="username" autoComplete="username" required className={inputClass} />
          </label>
          <label className="text-xs font-semibold text-[#6c6255]">
            Нууц үг (12+ тэмдэгт, bcrypt limit 72 bytes)
            <input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required className={inputClass} />
          </label>
          <label className="text-xs font-semibold text-[#6c6255]">
            Эрх
            <select name="role" className={inputClass}>
              <option value="DOCTOR">Эмч</option>
              <option value="RECEPTION">Бүртгэл</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className={`${primaryButtonClass} h-11 w-full`}
            >
              <UserPlus size={16} />
              {saving ? "Хадгалж байна..." : "Ажилтан нэмэх"}
            </button>
          </div>
          {operationError && <p role="alert" className="text-sm text-rose-700 sm:col-span-2 lg:col-span-3">{operationError}</p>}
          {notice && <p role="status" className="text-sm text-emerald-700 sm:col-span-2 lg:col-span-3">{notice}</p>}
        </form>

        <section className={`${pageCardClass} overflow-hidden`}>
          <h2 className="border-b border-[#efebe5] px-6 py-4 font-semibold text-[#39362f]">
            Системийн ажилтнууд
          </h2>
          {loading && <p className="p-6 text-sm text-[#89847b]">Уншиж байна...</p>}
          {error && <p role="alert" className="p-6 text-sm text-rose-700">{error.message}</p>}
          {!loading && !error && (
            <ul className="divide-y divide-[#f1eee8]">
              {employees.map((employee) => (
                <li key={employee._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div className="flex items-center gap-3">
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="size-9 rounded-xl object-cover"
                      />
                    ) : null}
                    <div>
                      <p className="text-sm font-semibold text-[#45413b]">
                        {employee.lastName || employee.firstName
                          ? `${employee.lastName} ${employee.firstName}`.trim()
                          : employee.name}
                      </p>
                      <p className="mt-1 text-xs text-[#89847b]">{employee.username} · {employee.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#f3f0ea] px-3 py-1 text-xs font-semibold text-[#746753]">{employee.role}</span>
                    {employee.role !== "ADMIN" && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEmployee(employee);
                            setEditingRegisterNumber(employee.registerNumber);
                            setEditingRegistration(
                              parseEmployeeRegisterNumber(
                                employee.registerNumber,
                              ),
                            );
                            setEditingAvatar(employee.avatar ?? "");
                            setFormError("");
                          }}
                          aria-label={`${employeeName(employee)} засах`}
                          title="Засах"
                          className={`${secondaryButtonClass} size-9 p-0`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmployee(employee)}
                          disabled={deleting || employee._id === user?._id}
                          aria-label={`${employeeName(employee)} устгах`}
                          title="Устгах"
                          className={`${dangerButtonClass} size-9 p-0`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {editingEmployee && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2b2a26]/40 p-4 backdrop-blur-[2px]"
            onClick={() => !updating && setEditingEmployee(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Ажилтны мэдээлэл засах"
              onClick={(event) => event.stopPropagation()}
              className={`${pageCardClass} w-full max-w-lg p-6`}
            >
              <div className="mb-5 flex items-center justify-between border-b border-[#e8e3db] pb-4">
                <h2 className="text-xl font-bold text-stone-900">
                  Ажилтны мэдээлэл засах
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  disabled={updating}
                  aria-label="Хаах"
                  className="rounded-lg p-1.5 text-[#8d867b] hover:bg-[#f0ece4] disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={handleUpdateEmployee}
                className="grid gap-4 sm:grid-cols-2"
              >
                <label className="text-xs font-semibold text-[#6c6255]">
                  Овог
                  <input
                    name="lastName"
                    required
                    defaultValue={editingEmployee.lastName}
                    className={inputClass}
                  />
                </label>
                <label className="text-xs font-semibold text-[#6c6255]">
                  Нэр
                  <input
                    name="firstName"
                    required
                    defaultValue={editingEmployee.firstName}
                    className={inputClass}
                  />
                </label>
                <label className="text-xs font-semibold text-[#6c6255]">
                  Нэвтрэх нэр
                  <input
                    name="username"
                    required
                    autoComplete="username"
                    defaultValue={editingEmployee.username}
                    className={inputClass}
                  />
                </label>
                <label className="text-xs font-semibold text-[#6c6255]">
                  Утас
                  <input
                    name="phone"
                    required
                    defaultValue={editingEmployee.phone}
                    className={inputClass}
                  />
                </label>
                <label className="text-xs font-semibold text-[#6c6255] sm:col-span-2">
                  Регистрийн дугаар
                  <input
                    name="registerNumber"
                    required
                    maxLength={10}
                    value={editingRegisterNumber}
                    onChange={(event) => {
                      const value = event.currentTarget.value.toUpperCase();
                      setEditingRegisterNumber(value);
                      setEditingRegistration(
                        parseEmployeeRegisterNumber(value),
                      );
                    }}
                    className={inputClass}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs text-[#70695e] sm:col-span-2">
                  <p>Нас: {editingRegistration?.age ?? "—"}</p>
                  <p>
                    Хүйс:{" "}
                    {editingRegistration?.gender === "MALE"
                      ? "Эрэгтэй"
                      : editingRegistration?.gender === "FEMALE"
                        ? "Эмэгтэй"
                        : "—"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <AvatarInput
                    value={editingAvatar}
                    onChange={setEditingAvatar}
                    disabled={updating}
                  />
                </div>
                <label className="text-xs font-semibold text-[#6c6255] sm:col-span-2">
                  Эрх
                  <select
                    name="role"
                    defaultValue={editingEmployee.role}
                    className={inputClass}
                  >
                    <option value="DOCTOR">Эмч</option>
                    <option value="RECEPTION">Бүртгэл</option>
                  </select>
                </label>
                {operationError && (
                  <p role="alert" className="text-sm text-rose-700 sm:col-span-2">
                    {operationError}
                  </p>
                )}
                <div className="flex gap-3 border-t border-[#e8e3db] pt-4 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    disabled={updating}
                    className={`${secondaryButtonClass} flex-1`}
                  >
                    Болих
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className={`${primaryButtonClass} flex-1`}
                  >
                    {updating ? "Хадгалж байна..." : "Хадгалах"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

const employeeName = (employee: EmployeeRecord) =>
  `${employee.lastName} ${employee.firstName}`.trim() || employee.name;

const getErrorMessage = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Үйлдлийг гүйцэтгэж чадсангүй.";
