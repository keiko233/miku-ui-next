import { Loader2Icon } from "lucide-react";
import type React from "react";

import { cn } from "@/lib/utils";

export function Spinner({
  className,
  ...props
}: React.ComponentProps<"output">): React.ReactElement {
  return (
    <output aria-label="Loading" className={cn("inline-flex", className)} {...props}>
      <Loader2Icon className="animate-spin" />
    </output>
  );
}
