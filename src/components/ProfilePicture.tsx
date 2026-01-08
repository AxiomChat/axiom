import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { UserProfile } from "@/hooks/get-user";

export function ProfileImage({
  name,
  url,
  className,
}: {
  name: string;
  url: string;
  className?: string;
}) {
  return (
    <Avatar className={cn("h-8 w-8 cursor-pointer", className)}>
      <AvatarImage src={url} alt={name} />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  );
}

export default function ProfilePreview({
  className,
  profile,
}: {
  profile?: UserProfile;
  className?: string;
}) {
  if (!profile)
    return (
      <Avatar className={cn("h-8 w-8 cursor-pointer", className)}>
        <AvatarFallback>Loading</AvatarFallback>
      </Avatar>
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className={cn("h-8 w-8 cursor-pointer", className)}>
          <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
          <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="center"
        sideOffset={8}
        className="w-64 p-4"
      >
        <div className="flex items-center gap-4">
          <Avatar className={cn("h-8 w-8 cursor-pointer", className)}>
            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-medium leading-none">
              {profile.display_name}
            </span>
            <span className="text-sm text-muted-foreground">
              @{profile.username}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <span className="text-lg font-bold">{1130} XP</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1">
            Message
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
