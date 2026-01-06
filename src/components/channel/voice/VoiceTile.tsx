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
        aspect-square rounded-xl
        bg-muted/40
        transition-all
        ${
          user.speaking
            ? "ring-4 ring-green-500 animate-pulse"
            : "ring-1 ring-border"
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

      {/* Speaking indicator */}
      {user.speaking && (
        <div className="absolute bottom-3 text-xs text-green-400">Speaking</div>
      )}
    </div>
  );
}
