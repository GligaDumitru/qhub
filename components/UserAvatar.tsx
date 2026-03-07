import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const UserAvatar = ({
  id,
  name = "",
  imageUrl,
  className = "h-9 w-9",
  fallbackClassName = "",
}: {
  id?: string;
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
}) => {
  if (!id) return null;

  const initials = (name ?? "")
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={ROUTES.PROFILE(id)}>
      <Avatar className={className}>
        <AvatarImage src={imageUrl ?? ""} width={36} height={36} alt="imageUrl" />
        <AvatarFallback
          className={cn("primary-gradient font-space-grotesk font-bold tracking-wider text-white", fallbackClassName)}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
};

export default UserAvatar;
