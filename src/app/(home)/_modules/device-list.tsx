"use server";

import { DeviceCard } from "@/components/device-card";
import { getKysely } from "@/lib/kysely";

export const DeviceList = async () => {
  const kysely = await getKysely();

  const query = await kysely.selectFrom("Devices").selectAll().execute();

  return query.length ? (
    <div className="grid grid-cols-1 px-4 sm:grid-cols-2 md:grid-cols-3">
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
