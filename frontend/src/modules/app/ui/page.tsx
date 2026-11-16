import React from "react";
import { cn } from "./utils";

export const pageCardClass =
  "rounded-3xl border border-stone-200 bg-white shadow-sm";

export const pageInputClass =
  "h-11 w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 disabled:cursor-not-allowed disabled:opacity-60";

export const pageTextAreaClass =
  "w-full resize-y rounded-xl border border-stone-200 bg-[#FAF8F5] px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition-all hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-900 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition-all hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-700 disabled:cursor-not-allowed disabled:opacity-60";

export const PageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full flex-col overflow-hidden bg-[#FAF8F5] text-stone-900",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PageContainer.displayName = "PageContainer";

export const PageSubHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-auto flex-none flex-wrap items-center gap-3 border-b border-stone-200 bg-[#FAF8F5]/90 px-6 py-3 backdrop-blur-md lg:px-8",
        className,
      )}
      {...props}
    />
  );
});
PageSubHeader.displayName = "PageSubHeader";

/** Гүйлгэгддэг үндсэн агуулгын хэсэг */
export const PageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "mx-auto min-h-0 w-full max-w-6xl min-w-0 flex-1 space-y-6 overflow-y-auto p-6 pb-32 lg:p-8",
        className,
      )}
      {...props}
    />
  );
});
PageContent.displayName = "PageContent";

/** Хуудасны гарчиг (заавал биш) */
export const PageTitle = ({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
      className,
    )}
  >
    <div>
      <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);