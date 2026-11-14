import React from "react";
import { cn } from "./utils";

export const PageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full flex-col overflow-hidden bg-[#f7f6f3] text-[#302f2b]",
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
        "flex h-auto flex-none flex-wrap items-center gap-3 border-b border-[#ece9e3] bg-[#f7f6f3]/90 px-5 py-3 backdrop-blur-md sm:px-8 lg:px-10",
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
        "min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pb-10 lg:pt-6",
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
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) => (
  <div className={cn("mb-6", className)}>
    <h1 className="text-[24px] font-medium tracking-[-0.04em] text-[#36342f] sm:text-[28px]">
      {title}
    </h1>
    {description && (
      <p className="mt-1.5 text-[12px] text-[#89847b]">{description}</p>
    )}
  </div>
);