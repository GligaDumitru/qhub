import { auth } from "@/auth";
import GlobalSearch from "@/components/search/GlobalSearch";
import UserAvatar from "@/components/UserAvatar";
import Image from "next/image";
import Link from "next/link";
import MobileNavigation from "./MobileNavigation";
import Theme from "./Theme";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="flex-between background-light900_dark-nav-bg shadow-light200_darknone border-b-light300_darknone fixed top-0 z-50 w-full border p-6 sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/images/site-logo.svg" alt="QHub Logo" width={23} height={23} />
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Q<span className="text-primary-500">Hub</span>
        </p>
      </Link>
      <GlobalSearch />
      <div className="flex-between gap-5">
        <Theme />
        {session ? <UserAvatar id={session.user?.id} name={session.user?.name} imageUrl={session.user?.image} /> : null}
        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
