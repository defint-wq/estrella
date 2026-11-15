import { useRef, useState, type FormEvent } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { UserPlus } from "lucide-react";
import { PageContainer, PageContent, PageTitle } from "../../modules/app/ui/page";
import { parseEmployeeRegisterNumber } from "../../modules/app/ui/registerParser";

const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      _id
      name
      firstName
      lastName
      username
      phone
      role
    }
  }
`;

const ADD_EMPLOYEE = gql`
  mutation CreateEmployee(
    $firstName: String!
    $lastName: String!
    $phone: String!
    $registerNumber: String!
    $username: String!
    $password: String!
    $role: EmployeeRole!
  ) {
    createEmployee(
      firstName: $firstName
      lastName: $lastName
      phone: $phone
      registerNumber: $registerNumber
      username: $username
      password: $password
      role: $role
    ) {
      _id
      username
      firstName
      lastName
    }
  }
`;

type EmployeeRow = {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  role: "ADMIN" | "RECEPTION" | "DOCTOR";
};

const inputClass =
  "h-11 w-full rounded-xl border border-[#e8e3db] bg-white px-3.5 text-sm text-[#37342f] outline-none focus:border-[#ad9272] focus:ring-4 focus:ring-[#ad9272]/10";

export const AdminDashboard = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { data, loading, error } = useQuery<{ employees: EmployeeRow[] }>(
    GET_EMPLOYEES,
  );
  const [registerNumber, setRegisterNumber] = useState("");
  const [registration, setRegistration] = useState<ReturnType<
    typeof parseEmployeeRegisterNumber
  >>(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [addEmployee, { loading: saving }] = useMutation(ADD_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
    onCompleted: () => {
      setNotice("Ажилтны бүртгэл амжилттай үүслээ.");
      setFormError("");
      setRegisterNumber("");
      setRegistration(null);
      formRef.current?.reset();
    },
    onError: (cause) => setFormError(cause.message),
  });

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
    addEmployee({
      variables: {
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        registerNumber: parsedRegistration.registerNumber,
        username: String(formData.get("username") ?? "").trim(),
        password,
        role: String(formData.get("role") ?? "DOCTOR"),
      },
    });
  };

  return (
    <PageContainer>
      <PageContent>
        <PageTitle title="Ажилтны эрх ба бүртгэл" />
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mb-8 grid gap-4 rounded-3xl border border-[#e9e3d9] bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
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
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-stone-700 px-4 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-60"
            >
              <UserPlus size={16} />
              {saving ? "Хадгалж байна..." : "Ажилтан нэмэх"}
            </button>
          </div>
          {formError && <p role="alert" className="text-sm text-rose-700 sm:col-span-2 lg:col-span-3">{formError}</p>}
          {notice && <p role="status" className="text-sm text-emerald-700 sm:col-span-2 lg:col-span-3">{notice}</p>}
        </form>

        <section className="overflow-hidden rounded-3xl border border-[#e9e3d9] bg-white">
          <h2 className="border-b border-[#efebe5] px-6 py-4 font-semibold text-[#39362f]">
            Системийн ажилтнууд
          </h2>
          {loading && <p className="p-6 text-sm text-[#89847b]">Уншиж байна...</p>}
          {error && <p role="alert" className="p-6 text-sm text-rose-700">{error.message}</p>}
          {!loading && !error && (
            <ul className="divide-y divide-[#f1eee8]">
              {(data?.employees ?? []).map((employee) => (
                <li key={employee._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#45413b]">
                      {employee.lastName || employee.firstName
                        ? `${employee.lastName} ${employee.firstName}`.trim()
                        : employee.name}
                    </p>
                    <p className="mt-1 text-xs text-[#89847b]">{employee.username} · {employee.phone}</p>
                  </div>
                  <span className="rounded-full bg-[#f3f0ea] px-3 py-1 text-xs font-semibold text-[#746753]">{employee.role}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </PageContent>
    </PageContainer>
  );
};
