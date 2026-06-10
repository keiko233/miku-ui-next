import type { PropsWithChildren, ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { DarkMode } from "./dark-mode";

export const Container = ({
  children,
  title,
  centerContent,
  rightContent,
}: PropsWithChildren & {
  title: string;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
}) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="bg-primary/15 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 px-4">
        <h1 className={cn("text-primary text-2xl font-extrabold", !centerContent && "flex-1")}>
          {title}
        </h1>

        {centerContent}

        {(rightContent || centerContent) && (
          <Separator orientation="vertical" className="mx-1 h-6" />
        )}

        <DarkMode />

        {rightContent}
      </div>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
};
