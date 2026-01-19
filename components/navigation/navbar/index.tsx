import Image from "next/image";
import Link from "next/link";
import Theme from "./Theme";

const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full p-6 sm:px-12 dark:shadow-none">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/images/site-logo.svg" alt="QHub Logo" width={23} height={23} />
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Q<span className="text-primary-500">Hub</span>
        </p>
      </Link>
      <p>Global Search</p>
      <div className="flex-between gap-5">
        <Theme />
      </div>
    </nav>
  );
};

export default Navbar;
