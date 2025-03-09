import { DeviceList } from "./_modules/device-list";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  page?: number;
  size?: number;
}>;

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const { page, size } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl">
      <DeviceList page={page} limit={size} />
    </div>
  );
}
