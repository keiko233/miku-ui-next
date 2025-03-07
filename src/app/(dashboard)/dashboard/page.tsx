import { InitDatabase } from "./_modules/init-database";
import { TestButtons } from "./_modules/test-buttons";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <InitDatabase />

      <TestButtons />
    </div>
  );
}
