import type { Device } from "@/schema";

export const DeviceInfo = ({ device }: { device: Device }) => {
  return (
    <div className="flex flex-col gap-0.5 text-sm">
      {device.changelog && (
        <div className="flex flex-col gap-1">
          <b className="text-base">Changelog:</b>
          <p className="text-sm whitespace-pre-line">{device.changelog}</p>
        </div>
      )}

      {device.note && (
        <div className="flex flex-col gap-1">
          <b className="text-base">Note:</b>
          <p className="text-sm whitespace-pre-line">{device.note}</p>
        </div>
      )}
    </div>
  );
};
