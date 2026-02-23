import { auth, signOut } from "@/auth";
import ROUTES from "@/constants/routes";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import NavLinks from "./navbar/NavLinks";

const LeftSidebar = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 left-0 z-30 flex h-screen min-h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 max-sm:hidden lg:w-[266px] dark:shadow-none">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks userId={userId} />
      </div>
      <div className="flex flex-col gap-3">
        {userId ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button
              type="submit"
              className="base-medium text-dark300_light900 hover:text-dark500_light500! flex w-full cursor-pointer items-center justify-start gap-4 bg-transparent! px-4"
            >
              <LogOut className="size-5" />
              <span className="base-medium max-lg:hidden">Logout</span>
            </Button>
          </form>
        ) : (
          <>
            <Button asChild className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
              <Link href={ROUTES.SIGN_IN}>
                <Image
                  src="/icons/user.svg"
                  alt="QHub Logo"
                  width={20}
                  height={20}
                  className={"invert-colors lg:hidden"}
                />
                <span className="primary-text-gradient max-lg:hidden">Log In</span>
              </Link>
            </Button>
            <Button
              asChild
              className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
            >
              <Link href={ROUTES.SIGN_UP}>
                <Image
                  src="/icons/account.svg"
                  alt="Sign Up"
                  width={20}
                  height={20}
                  className={"invert-colors lg:hidden"}
                />
                <span className="max-lg:hidden">Sign Up</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default LeftSidebar;
