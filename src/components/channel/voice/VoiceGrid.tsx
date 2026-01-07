import App from "@/types/app";
import { VoiceTile, VoiceUser } from "./VoiceTile";
import { cn } from "@/lib/utils";

export default function VoiceGrid({
  app,
  users,
}: {
  app: App;
  users: VoiceUser[];
}) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div
        className={cn(
          "grid gap-4 grid-cols-1",
          app.sidebarOpen
            ? "min-[930px]:grid-cols-2 min-[1200px]:grid-cols-3 min-[1600px]:grid-cols-4"
            : "min-[560px]:grid-cols-2 min-[1200px]:grid-cols-3 min-[1600px]:grid-cols-4"
        )}
      >
        {users.map((user) => (
          <VoiceTile key={user.id} user={user} app={app} />
        ))}
      </div>
    </div>
  );
}
