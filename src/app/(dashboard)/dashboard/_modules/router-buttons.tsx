"use client";

import { Button } from "@libnyanpasu/material-design-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const RouterButtons = () => {
  const pathname = usePathname();

  const links = {
    "/dashboard": "Device",
    "/dashboard/context": "Context",
  };

  return (
    <div className="flex flex-1 items-center justify-center gap-2">
      {Object.entries(links).map(([path, label]) => (
        <Link key={path} href={{ pathname: path }}>
          <Button
            variant={path === pathname ? "flat" : undefined}
            className="px-6"
          >
            {label}
          </Button>
        </Link>
      ))}
    </div>
  );
};
