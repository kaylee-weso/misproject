"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

// -----------------------------
// Breadcrumb Container
// -----------------------------
function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(
        "text-2xl font-sans",
        className
      )}
      {...props}
    />
  );
}

// -----------------------------
// Breadcrumb List (ol)
// -----------------------------
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        className
      )}
      {...props}
    />
  );
}

// -----------------------------
// Breadcrumb Item (li)
// -----------------------------
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

// -----------------------------
// Breadcrumb Link (<a>)
// -----------------------------
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "transition-colors hover:text-[#2f3e46] font-sans text-2xl text-muted-foreground", // greyed by default
        className
      )}
      {...props}
    />
  );
}

// -----------------------------
// Current Page (<span>)
// -----------------------------
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(
        "font-normal text-[#2f3e46] font-sans text-2xl", // active page color
        className
      )}
      {...props}
    />
  );
}

// -----------------------------
// Separator (span, not li)
// -----------------------------
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5 text-muted-foreground", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </span>
  );
}

// -----------------------------
// Ellipsis (span for collapsed items)
// -----------------------------
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4 text-muted-foreground",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};