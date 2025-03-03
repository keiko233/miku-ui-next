// import Image from "next/image";
import { Button } from "@libnyanpasu/material-design-react";
import { type PropsWithChildren } from "react";

export const Container = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-dvh overflow-x-hidden">
      <div className="bg-primary-container flex h-16 items-center gap-2 px-4">
        {/* <Image src="/banner.png" width={128} height={128} alt="banner" /> */}

        <h1 className="text-primary flex-1 text-2xl font-extrabold">
          Miku UI Download
        </h1>

        <Button variant="flat">Tasks</Button>
      </div>

      <div className="h-dvh-subtract-16 overflow-x-hidden">{children}</div>
    </div>
  );
};
