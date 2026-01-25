import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import NavLinks from "./navbar/NavLinks";

const LeftSidebar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 left-0 z-30 flex h-screen min-h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 max-sm:hidden lg:w-[266px] dark:shadow-none">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks />
      </div>
      <div className="flex flex-col gap-3">
        <Link href={ROUTES.SIGN_IN}>
          <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
            <Image src="/icons/user.svg" alt="QHub Logo" width={20} height={20} className={"invert-colors lg:hidden"} />
            <span className="primary-text-gradient max-lg:hidden">Log In</span>
          </Button>
        </Link>
        <Link href={ROUTES.SIGN_UP}>
          <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none">
            <Image
              src="/icons/account.svg"
              alt="Sign Up"
              width={20}
              height={20}
              className={"invert-colors lg:hidden"}
            />
            <span className="max-lg:hidden">Sign Up</span>
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default LeftSidebar;
