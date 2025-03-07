import { DeviceList } from "./_modules/device-list";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl">
      <DeviceList />
    </div>
  );
}
