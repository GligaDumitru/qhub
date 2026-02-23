import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ROUTES from "@/constants/routes";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NavLinks from "./NavLinks";

const MobileNavigation = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Image
          src="/icons/hamburger.svg"
          alt="Mobile Navigation Menu"
          width={36}
          height={36}
          className="invert-colors sm:hidden"
        />
      </SheetTrigger>
      <SheetContent side="left" className="background-light900_dark200 border-none">
        <SheetHeader>
          <SheetTitle className="hidden">Navigation</SheetTitle>
          <Link href="/" className="flex items-center gap-1">
            <Image src="/images/site-logo.svg" alt="QHub Logo" width={23} height={23} />
            <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900">
              Q<span className="text-primary-500">Hub</span>
            </p>
          </Link>
        </SheetHeader>

        <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto">
          <SheetClose asChild>
            <section className="flex h-full flex-col gap-6 pt-16">
              <NavLinks isMobile userId={userId} />
            </section>
          </SheetClose>
        </div>
        <SheetFooter>
          {userId ? (
            <SheetClose asChild>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <Button
                  type="submit"
                  className="base-medium text-dark300_light900 hover:text-dark500_light500! flex w-full cursor-pointer items-center justify-start gap-4 bg-transparent! p-0"
                >
                  <LogOut className="size-5" />
                  <span className="base-medium">Logout</span>
                </Button>
              </form>
            </SheetClose>
          ) : (
            <>
              <SheetClose asChild>
                <Link href={ROUTES.SIGN_IN}>
                  <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                    <span className="primary-text-gradient">Log In</span>
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href={ROUTES.SIGN_UP}>
                  <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none">
                    Sign Up
                  </Button>
                </Link>
              </SheetClose>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
