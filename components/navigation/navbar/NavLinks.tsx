"use client";

import { SheetClose } from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NavLink = ({
  isActive,
  route,
  label,
  imgURL,
  isMobile,
}: {
  isActive: boolean;
  route: string;
  label: string;
  imgURL: string;
  isMobile?: boolean;
}) => {
  if (isMobile) {
    return (
      <SheetClose asChild>
        <Link
          href={route}
          className={cn(
            isActive ? "primary-gradient text-light-900 rounded-lg" : "text-dark300_light900",
            "flex items-center justify-start gap-4 bg-transparent p-4"
          )}
        >
          <Image src={imgURL} alt={label} width={20} height={20} className={cn({ "invert-colors": !isActive })} />
          <p className={cn(isActive ? "base-bold" : "base-medium", !isMobile && "max-lg:hidden")}>{label}</p>
        </Link>
      </SheetClose>
    );
  }

  return (
    <React.Fragment key={route}>
      <Link
        href={route}
        className={cn(
          isActive ? "primary-gradient text-light-900 rounded-lg" : "text-dark300_light900",
          "flex items-center justify-start gap-4 bg-transparent p-4"
        )}
      >
        <Image src={imgURL} alt={label} width={20} height={20} className={cn({ "invert-colors": !isActive })} />
        <p className={cn(isActive ? "base-bold" : "base-medium", !isMobile && "max-lg:hidden")}>{label}</p>
      </Link>
    </React.Fragment>
  );
};
const NavLinks = ({ isMobile }: { isMobile?: boolean }) => {
  const pathname = usePathname();

  const userId = 1;
  return (
    <>
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.route || (pathname.includes(link.route) && link.route.length > 1);

        if (link.route === "/profile") {
          if (userId) {
            link.route = `${link.route}/${userId}`;
          } else return null;
        }

        const linkComponent = (
          <Link
            href={link.route}
            className={cn(
              isActive ? "primary-gradient text-light-900 rounded-lg" : "text-dark300_light900",
              "flex items-center justify-start gap-4 bg-transparent p-4"
            )}
          >
            <Image
              src={link.imgURL}
              alt={link.label}
              width={20}
              height={20}
              className={cn({ "invert-colors": !isActive })}
            />
            <p className={cn(isActive ? "base-bold" : "base-medium", !isMobile && "max-lg:hidden")}>{link.label}</p>
          </Link>
        );

        if (!isMobile) {
          return <React.Fragment key={link.route}>{linkComponent}</React.Fragment>;
        }

        return (
          <SheetClose asChild key={link.route}>
            {linkComponent}
          </SheetClose>
        );
      })}
    </>
  );
};

export default NavLinks;
