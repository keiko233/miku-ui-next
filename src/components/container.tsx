import type { PropsWithChildren, ReactNode } from "react";
import { DrakMode } from "./dark-mode";

export const Container = ({
  children,
  title,
  rightContent,
}: PropsWithChildren & {
  title: string;
  rightContent?: ReactNode;
}) => {
  return (
    <div className="dark:text-surface h-dvh overflow-x-hidden">
      <div className="bg-primary-container dark:bg-on-secondary-container flex h-16 items-center gap-2 px-4">
        {/* <Image src="/banner.png" width={128} height={128} alt="banner" /> */}

        <h1 className="text-primary flex-1 text-2xl font-extrabold">{title}</h1>

        <DrakMode />

        {rightContent}
      </div>

      <div className="h-dvh-subtract-16 overflow-x-hidden">{children}</div>
    </div>
  );
};
