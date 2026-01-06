export type VoiceUser = {
  id: string;
  name: string;
  speaking: boolean;
  muted?: boolean;
};

export function VoiceTile({ user }: { user: VoiceUser }) {
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
      {/* Avatar */}
      <div
        className={`
          h-20 w-20 rounded-full
          flex items-center justify-center
          text-2xl font-semibold
          bg-background
        `}
      >
        {user.name[0].toUpperCase()}
      </div>

      {/* Name */}
      <div className="mt-3 text-sm font-medium">{user.name}</div>

      {/* Speaking indicator */}
      {user.speaking && (
        <div className="absolute bottom-3 text-xs text-green-400">Speaking</div>
      )}
    </div>
  );
}
