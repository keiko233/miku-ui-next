"use server";

import { getDevices } from "@/actions/query/devices";
import { DeviceCard } from "@/components/device-card";
import { Pagination } from "@/components/pagination";

export const DeviceList = async ({
  page,
  limit,
}: {
  page?: number;
  limit?: number;
}) => {
  const { devices, pagination } = await getDevices({
    page,
    limit,
  });

  return devices.length ? (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}

      <Pagination
        className="md:col-span-3 col-span-1 sm:col-span-2"
        pagination={pagination}
      />
    </div>
  ) : (
    <div className="grid h-32 place-content-center">
      <p className="text-zinc-500">No devices found</p>
    </div>
  );
};
