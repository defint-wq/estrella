import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { CalendarDays, Clock, Eye, Stethoscope } from "lucide-react";
import { PageContainer, PageContent } from "../modules/app/ui/page";
import { ConsultationForm } from "../modules/patient/components/ConsultationForm";
import { GET_PATIENTS } from "../modules/patient/graphql/query/patient";
import type { Appointment, Patient } from "../modules/patient/types/patient";

type UpcomingAppointment = Appointment & {
  patientName: string;
  registrationNumber: string;
};

const PATIENTS_PER_PAGE = 100;

const pad = (value: number) => String(value).padStart(2, "0");

const formatDate = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const HomePage = () => {
  const client = useApolloClient();
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<UpcomingAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadAppointments = async () => {
      try {
        const firstPage = await client.query({
          query: GET_PATIENTS,
          variables: { page: 1, perPage: PATIENTS_PER_PAGE },
          fetchPolicy: "network-only",
        });
        const patients: Patient[] = [...firstPage.data.patients.list];
        const totalPages = Math.max(firstPage.data.patients.pageInfo.totalPages ?? 1, 1);

        for (let page = 2; page <= totalPages; page += 1) {
          const result = await client.query({
            query: GET_PATIENTS,
            variables: { page, perPage: PATIENTS_PER_PAGE },
            fetchPolicy: "network-only",
          });
          patients.push(...result.data.patients.list);
        }

        const now = Date.now();
        const upcoming = patients
          .flatMap((patient) =>
            (patient.appointments ?? []).flatMap((appointment) => {
              const start = new Date(appointment.startTime).getTime();
              if (appointment.status !== "SCHEDULED" || !Number.isFinite(start) || start < now) {
                return [];
              }

              return [{
                _id: appointment._id,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                doctorName: appointment.doctorName,
                status: appointment.status,
                diagnosis: appointment.diagnosis,
                examinationNotes: appointment.examinationNotes,
                symptoms: appointment.symptoms,
                treatment: appointment.treatment,
                patientName: `${patient.lastName} ${patient.firstName}`.trim(),
                registrationNumber: patient.registrationNumber,
              }];
            }),
          )
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
          );

        if (isActive) {
          setAppointments(upcoming);
          setError(null);
        }
      } catch (cause) {
        if (isActive) {
          setError(cause instanceof Error ? cause.message : "Үзлэгийн жагсаалт авахад алдаа гарлаа.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadAppointments();
    return () => {
      isActive = false;
    };
  }, [client]);

  return (
    <PageContainer>
      <PageContent className="pt-0 sm:pt-0 lg:pt-0">
        <header className="sticky top-0 z-20 -mx-5 mb-7 bg-[#f7f6f3]/95 px-5 pb-5 pt-6 backdrop-blur-md sm:-mx-8 sm:px-8 sm:pt-8 lg:-mx-10 lg:px-10 lg:pt-6">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#353a33] text-[#eee8dc] shadow-sm">
              <CalendarDays size={20} strokeWidth={1.6} />
            </div>
            <div>
              <h1 className="text-[25px] font-medium tracking-[-0.04em] text-[#36342f] sm:text-[30px]">
                Удахгүй болох үзлэгүүд
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#89847b]">
                Үйлчлүүлэгчдийн товлосон үзлэгийг эхлэх цагаар нь эрэмбэлэв.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-3" aria-label="Уншиж байна">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl border border-[#ece8e1] bg-white"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center text-sm text-rose-700"
          >
            Үзлэгийн жагсаалт ачаалж чадсангүй: {error}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-[#e4dfd6] bg-[#fbfaf8] py-12 text-center">
            <CalendarDays size={20} className="text-[#b5ab98]" />
            <p className="text-sm text-[#9b968d]">Удахгүй болох үзлэг алга байна.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {appointments.map((appointment) => (
              <article
                key={appointment._id}
                className="flex flex-col gap-3 rounded-[20px] border border-[#e9e5de] bg-white p-5 shadow-[0_4px_22px_rgba(60,52,41,0.035)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f3f0ea] text-[#89785f]">
                    <Clock size={19} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-[#34362f]">
                      {appointment.patientName || "Үйлчлүүлэгч"}
                    </h2>
                    <p className="mt-1 text-xs text-[#89847b]">
                      {appointment.registrationNumber}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#5f594f] sm:justify-end">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={15} className="text-[#a48663]" />
                    {formatDate(appointment.startTime)}
                  </span>
                  <span className="inline-flex items-center gap-2 font-semibold text-[#34362f]">
                    <Clock size={15} className="text-[#a48663]" />
                    {formatTime(appointment.startTime)}–{formatTime(appointment.endTime)}
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs text-[#89847b]">
                    <Stethoscope size={14} className="text-[#a48663]" />
                    {appointment.doctorName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(appointment)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d9cbb5] bg-[#f6f0e6] px-4 py-2.5 text-sm font-semibold text-[#725d3e] transition hover:bg-[#efe6d8]"
                  >
                    <Eye size={15} /> Үзэх
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {selectedAppointment && (
          <ConsultationForm
            key={selectedAppointment._id}
            appointment={selectedAppointment}
            patientName={selectedAppointment.patientName}
            registrationNumber={selectedAppointment.registrationNumber}
            onClose={() => setSelectedAppointment(null)}
            onSaved={() =>
              setAppointments((current) =>
                current.filter((appointment) => appointment._id !== selectedAppointment._id),
              )
            }
          />
        )}
      </PageContent>
    </PageContainer>
  );
};
