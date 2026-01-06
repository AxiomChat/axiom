import App from "@/types/app";
import { VoiceTile, VoiceUser } from "./VoiceTile";

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
        className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
      >
        {users.map((user) => (
          <VoiceTile key={user.id} user={user} app={app} />
        ))}
      </div>
    </div>
  );
}
