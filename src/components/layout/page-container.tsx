import type { ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
  pageTitle?: string;
  pageDescription?: string;
  pageHeaderAction?: ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export default function PageContainer({
  children,
  scrollable = false,
  className,
  pageTitle,
  pageDescription,
  pageHeaderAction,
  breadcrumb,
}: PageContainerProps) {
  return (
    <div className={cn("w-full max-w-full space-y-3 sm:space-y-4", scrollable && "overflow-x-hidden overflow-y-auto", className)}>
      {breadcrumb && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === breadcrumb.length - 1 || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {(pageTitle || pageDescription || pageHeaderAction) && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1 space-y-1">
              {pageTitle && <Heading title={pageTitle} description={pageDescription} />}
            </div>
            {pageHeaderAction && (
              <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center [&_a]:w-full [&_a]:sm:w-auto [&_button]:w-full [&_button]:sm:w-auto">
                {pageHeaderAction}
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {children}
    </div>
  );
}
