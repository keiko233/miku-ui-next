import { Container } from "@/components/container";
import { DeviceCard } from "@/components/device-card";
import prisma from "@/libs/prisma";

export default async function Home() {
  const query = await prisma.devices.findMany();

  return (
    <Container>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 px-4 sm:grid-cols-2 md:grid-cols-3">
          {query.map((device) => (
            <DeviceCard device={device} />
          ))}
        </div>
      </div>
    </Container>
  );
}
