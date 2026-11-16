import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Check, ChevronDown, ChevronUp, History, Pencil, Plus, Search, Trash2, User, UserRound,
} from "lucide-react";
import { GET_PATIENTS } from "../graphql/query/patient";
import { PATIENT_REMOVE } from "../graphql/mutation/patientRemove";
import { AppointmentList } from "./AppointmentList";
import { AppointmentModal } from "./AppointentModal";
import {
  PatientEditModal,
  type PatientEditRecord,
} from "./PatientEditModal";
import { useDebouncedValue } from "../../app/hooks/useDebouncedValue";
import { InfiniteScrollTrigger } from "../../../components/InfiniteScrollTrigger";
import type { PatientsQuery } from "../types/patient";
import { useAuth } from "../../auth/AuthContext";
import {
  dangerButtonClass,
  pageCardClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../app/ui/page";

interface PatientAppointment {
  _id: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  startTime: string;
  endTime: string;
  doctorName: string;
  diagnosis?: string;
  examinationNotes?: string;
  symptoms?: string;
  treatment?: string;
}

interface Patient {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  registrationNumber?: string | null;
  age?: number | null;
  sex?: "MALE" | "FEMALE" | string | null;
  appointments?: PatientAppointment[] | null;
}

interface PatientListProps {
  searchQuery: string;
}

const PATIENTS_PER_PAGE = 10;

export const PatientList = ({ searchQuery }: PatientListProps) => {
  const { user } = useAuth();
  const canManagePatients =
    user?.role === "ADMIN" || user?.role === "RECEPTION";
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const {
    data,
    loading: queryLoading,
    error,
    refetch,
    fetchMore,
  } = useQuery(GET_PATIENTS, {
    variables: {
      page: 1,
      perPage: PATIENTS_PER_PAGE,
      search: debouncedSearch.trim() || null,
    },
    notifyOnNetworkStatusChange: true,
  });

  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const fetchMoreLock = useRef(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeHistoryPatientId, setActiveHistoryPatientId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingPatient, setEditingPatient] =
    useState<PatientEditRecord | null>(null);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(
    null,
  );
  const [removePatient] = useMutation(PATIENT_REMOVE);

  const patients: Patient[] = data?.patients?.list || [];
  const pageInfo = data?.patients.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;
  const initialLoading = queryLoading && !data?.patients;

  useEffect(() => {
    setLoadMoreError(null);
  }, [debouncedSearch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || queryLoading || fetchMoreLock.current) return;

    fetchMoreLock.current = true;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const currentPage = pageInfo?.currentPage ?? 1;
      await fetchMore({
        variables: {
          page: currentPage + 1,
          perPage: PATIENTS_PER_PAGE,
          search: debouncedSearch.trim() || null,
        },
        updateQuery: (
          previous,
          { fetchMoreResult },
        ): PatientsQuery => {
          if (!fetchMoreResult) return previous;
          return {
            ...previous,
            patients: {
              ...previous.patients,
              ...fetchMoreResult.patients,
              list: [
                ...previous.patients.list,
                ...fetchMoreResult.patients.list,
              ],
            },
          };
        },
      });
    } catch (cause) {
      setLoadMoreError(
        cause instanceof Error
          ? cause.message
          : "Үлдсэн үйлчлүүлэгчдийг ачаалж чадсангүй.",
      );
    } finally {
      fetchMoreLock.current = false;
      setLoadingMore(false);
    }
  }, [
    debouncedSearch,
    fetchMore,
    hasMore,
    pageInfo?.currentPage,
    queryLoading,
  ]);
  const handleLoadMore = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  const toggleHistory = (id: string) =>
    setActiveHistoryPatientId((current) => (current === id ? null : id));

  const handleRemovePatient = async (patient: Patient) => {
    const patientName =
      `${patient.lastName ?? ""} ${patient.firstName ?? ""}`.trim();
    if (
      !window.confirm(
        `${patientName || "Энэ үйлчлүүлэгч"}-г устгавал түүнтэй холбоотой бүх цагийн бүртгэл мөн устна. Үргэлжлүүлэх үү?`,
      )
    ) {
      return;
    }

    setDeletingPatientId(patient._id);
    setActionError("");
    try {
      await removePatient({ variables: { ids: [patient._id] } });
      setNotice("Үйлчлүүлэгч болон холбогдох цагийн бүртгэлүүд устгагдлаа.");
      void refetch().catch((cause: unknown) => {
        setActionError(
          cause instanceof Error
            ? `Устгасан боловч жагсаалтыг шинэчилж чадсангүй: ${cause.message}`
            : "Устгасан боловч жагсаалтыг шинэчилж чадсангүй.",
        );
      });
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "Үйлчлүүлэгчийг устгаж чадсангүй.",
      );
    } finally {
      setDeletingPatientId(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="grid gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-stone-200 bg-white" />
        ))}
        <p className="pt-1 text-center text-[11px] text-[#9b968d]">
          Уншиж байна... Сервер унтсан байвал асахад 30–60 секунд хүлээнэ үү.
        </p>
      </div>
    );
  }

  if (error && !data?.patients) {
    return (
      <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center text-[12px] text-rose-700">
        Алдаа: {error.message}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-[#dce6da] bg-[#f3f7f1] px-4 py-3 text-[12px] text-[#597052]">
          <Check size={15} /> {notice}
        </div>
      )}
      {actionError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
          {actionError}
        </div>
      )}

      {patients.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-12 text-center">
          <Search size={20} className="text-[#b5ab98]" />
          <p className="text-[12px] text-[#9b968d]">
            {searchQuery.trim()
              ? "Хайлтад тохирох үйлчлүүлэгч олдсонгүй."
              : "Бүртгэлтэй үйлчлүүлэгч одоогоор байхгүй байна."}
          </p>
        </div>
      )}

      {patients.map((patient) => {
        const isOpen = activeHistoryPatientId === patient._id;
        const scheduledCount =
          patient.appointments?.filter((a) => a.status === "SCHEDULED").length ?? 0;
        const isMale = patient.sex === "MALE";

        return (
          <div
            key={patient._id}
            className={`${pageCardClass} p-5 transition hover:border-stone-300 sm:p-6`}
          >
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              {/* Avatar */}
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold ${
                  isMale ? "bg-[#dce4dc] text-[#526458]" : "bg-[#e7dfeb] text-[#695a70]"
                }`}
              >
                {patient.firstName ? patient.firstName[0].toUpperCase() : "P"}
              </div>

              {/* Мэдээлэл */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#34362f]">
                    {patient.lastName} {patient.firstName}
                  </h3>
                  {patient.age != null && (
                    <span className="rounded-full bg-[#f4f1ec] px-2.5 py-0.5 text-[10px] font-medium text-[#8b8173]">
                      {patient.age} нас
                    </span>
                  )}
                  {scheduledCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f0e6] px-2.5 py-0.5 text-[10px] font-medium text-[#987b53]">
                      <span className="size-1.5 rounded-full bg-[#bd9a68]" />
                      {scheduledCount} товлосон
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#9b968d]">
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-[#b5ab98]" />
                    <span className="uppercase tracking-wide text-[#5f594f]">
                      {patient.registrationNumber}
                    </span>
                  </span>
                  {patient.sex && (
                    <span className="flex items-center gap-1.5">
                      <UserRound size={13} className="text-[#b5ab98]" />
                      <span className="text-[#5f594f]">{isMale ? "Эр" : "Эм"}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Үйлдэл */}
              <div className="flex w-full items-center gap-2 md:w-auto">
                <button
                  type="button"
                  onClick={() => toggleHistory(patient._id)}
                  aria-expanded={isOpen}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition md:flex-none ${
                    isOpen
                      ? "border-[#e3d6bd] bg-[#fbf7f0] text-[#7d6540]"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <History size={14} />
                  <span>Үзлэгүүд</span>
                  {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {user?.role !== "DOCTOR" && (
                  <button
                    type="button"
                    onClick={() => setSelectedPatientId(patient._id)}
                    className={`${primaryButtonClass} flex-1 md:flex-none`}
                  >
                    <Plus size={14} />
                    <span>Цаг өгөх</span>
                  </button>
                )}
                {canManagePatients && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingPatient(patient)}
                      aria-label={`${patientName(patient)} мэдээлэл засах`}
                      title="Засах"
                      className={`${secondaryButtonClass} size-10 p-0`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRemovePatient(patient)}
                      disabled={deletingPatientId !== null}
                      aria-label={`${patientName(patient)} устгах`}
                      title="Устгах"
                      className={`${dangerButtonClass} size-10 p-0`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {isOpen && (
              <AppointmentList
                appointments={patient.appointments || []}
                patientName={`${patient.lastName ?? ""} ${patient.firstName ?? ""}`.trim()}
                registrationNumber={patient.registrationNumber ?? ""}
              />
            )}
          </div>
        );
      })}

      <InfiniteScrollTrigger
        hasMore={hasMore}
        loading={queryLoading || loadingMore}
        error={loadMoreError}
        onLoadMore={handleLoadMore}
      />

      {selectedPatientId && (
        <AppointmentModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onSuccess={() => {
            setSelectedPatientId(null);
            refetch();
            setNotice("Цаг амжилттай товлогдлоо.");
            window.setTimeout(() => setNotice(""), 3200);
          }}
        />
      )}
      {editingPatient && canManagePatients && (
        <PatientEditModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={() => {
            setEditingPatient(null);
            setActionError("");
            setNotice("Үйлчлүүлэгчийн мэдээлэл шинэчлэгдлээ.");
            void refetch().catch((cause: unknown) => {
              setActionError(
                cause instanceof Error
                  ? `Мэдээлэл хадгалагдсан боловч жагсаалтыг шинэчилж чадсангүй: ${cause.message}`
                  : "Мэдээлэл хадгалагдсан боловч жагсаалтыг шинэчилж чадсангүй.",
              );
            });
          }}
        />
      )}
    </div>
  );
};

const patientName = (patient: Patient) =>
  `${patient.lastName ?? ""} ${patient.firstName ?? ""}`.trim() ||
  "Үйлчлүүлэгч";