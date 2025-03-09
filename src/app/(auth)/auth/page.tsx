import {
  Card,
  CardContent,
  CardHeader,
} from "@libnyanpasu/material-design-react";
import { GitHub } from "./_modules/github";

export default async function Page() {
  return (
    <Card className="w-96">
      <CardHeader>Authenticate</CardHeader>

      <CardContent>
        <GitHub />
      </CardContent>
    </Card>
  );
}
