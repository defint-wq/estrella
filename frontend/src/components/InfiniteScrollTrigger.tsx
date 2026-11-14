import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";

interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  loading: boolean;
  error?: string | null;
  onLoadMore: () => void;
}

export const InfiniteScrollTrigger = ({
  hasMore,
  loading,
  error,
  onLoadMore,
}: InfiniteScrollTriggerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !hasMore || loading || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "0px 0px 240px 0px" },
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [error, hasMore, loading, onLoadMore]);

  if (!hasMore && !error) return null;

  return (
    <div
      ref={triggerRef}
      aria-live="polite"
      aria-busy={loading}
      className="flex min-h-12 items-center justify-center py-3"
    >
      {error ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <p role="alert" className="text-sm text-rose-700">
            Дараагийн хэсгийг ачаалж чадсангүй: {error}
          </p>
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-lg border border-[#e9e4dc] bg-white px-3 py-1.5 text-sm font-medium text-[#625b50] hover:bg-[#f8f6f2]"
          >
            Дахин оролдох
          </button>
        </div>
      ) : loading ? (
        <span className="inline-flex items-center gap-2 text-sm text-[#89847b]">
          <LoaderCircle size={16} className="animate-spin" />
          Ачаалж байна...
        </span>
      ) : (
        <span className="text-xs text-[#a19a8f]">Доош гүйлгэж үргэлжлүүлнэ үү</span>
      )}
    </div>
  );
};
