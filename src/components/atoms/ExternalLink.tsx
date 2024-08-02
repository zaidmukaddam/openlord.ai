import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      className={cn("text-blue-500 underline-offset-4 hover:underline", className)}
    >
      {children}
    </a>
  );
}
