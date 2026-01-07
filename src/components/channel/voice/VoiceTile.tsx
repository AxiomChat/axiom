import AsyncValue from "@/components/AsyncValue";
import App from "@/types/app";

export type VoiceUser = {
  id: string;
  speaking: boolean;
  muted?: boolean;
};

export function VoiceTile({ user, app }: { app: App; user: VoiceUser }) {
  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        aspect-[16/9] rounded-xl
        bg-muted/40
        transition-all
        ${
          user.speaking ? "border-4 border-green-500" : "border-1 border-border"
        }
        ${user.muted ? "opacity-50" : ""}
      `}
    >
      {/* Avatar and name */}
      <AsyncValue
        func={() => app.getUserById(user.id)}
        render={({ value }) => (
          <>
            <img
              src={value?.avatar_url}
              alt="Pfp"
              className="h-20 w-20 rounded-full"
            />

            <div className="mt-3 text-sm font-medium">
              {value?.display_name}
            </div>
          </>
        )}
      />
    </div>
  );
}
