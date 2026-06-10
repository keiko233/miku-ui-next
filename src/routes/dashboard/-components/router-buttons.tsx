"use client";

import { Link, useLocation } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const links = {
  "/dashboard": "Device",
  "/dashboard/context": "Context",
} as const;

export const RouterButtons = () => {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-1 items-center justify-center gap-2">
      {Object.entries(links).map(([path, label]) => (
        <Link
          key={path}
          to={path as "/dashboard" | "/dashboard/context"}
          aria-current={path === pathname ? "page" : undefined}
          className="rounded-md"
        >
          <Button variant={path === pathname ? "default" : "ghost"}>{label}</Button>
        </Link>
      ))}
    </div>
  );
};
