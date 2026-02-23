import ROUTES from "@/constants/routes";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const UserAvatar = ({ id, name = "", imageUrl }: { id?: string; name?: string | null; imageUrl?: string | null }) => {
  if (!id) return null;

  const initials = (name ?? "")
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={ROUTES.PROFILE(id)}>
      <Avatar className="h-9 w-9">
        <AvatarImage src={imageUrl ?? ""} width={36} height={36} alt="imageUrl" />
        <AvatarFallback className="primary-gradient font-space-grotesk font-bold tracking-wider text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
};

export default UserAvatar;
