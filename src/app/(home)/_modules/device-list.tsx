"use server";

import { getDevices } from "@/actions/query/devices";
import { DeviceCard } from "@/components/device-card";

export const DeviceList = async () => {
  const query = await getDevices();

  return query.length ? (
    <div className="grid grid-cols-1 p-4 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {query.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </div>
  ) : (
    <div className="grid h-32 place-content-center">
      <p className="text-zinc-500">No devices found</p>
    </div>
  );
};
