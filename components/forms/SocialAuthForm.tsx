"use client";

import ROUTES from "@/constants/routes";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "../ui/button";

const SocialAuthForm = () => {
  const handleSignIn = async (provider: "github" | "google") => {
    try {
      await signIn(provider, {
        callbackUrl: ROUTES.HOME,
        redirect: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("Sign-in Failed", {
        description: error instanceof Error ? error.message : "An error occured while sign-in",
      });
    }
  };
  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button
        onClick={() => handleSignIn("github")}
        className="background-dark400_light900 body-medium text-dark200_light800 rounded-2 hover:background-light800_dark300 min-h-12 flex-1 px-4 py-3.5 hover:cursor-pointer"
      >
        <Image
          src="/icons/github.svg"
          alt="GitHub Logo"
          width={20}
          height={20}
          className="invert-colors mr-2.5 object-contain"
        />
        <span className="flex-1">Log in with GitHub</span>
      </Button>
      <Button
        onClick={() => handleSignIn("google")}
        className="background-dark400_light900 body-medium text-dark200_light800 rounded-2 hover:background-light800_dark300 min-h-12 flex-1 px-4 py-3.5 hover:cursor-pointer"
      >
        <Image src="/icons/google.svg" alt="Google Logo" width={20} height={20} className="mr-2.5 object-contain" />
        <span className="flex-1">Log in with Google</span>
      </Button>
    </div>
  );
};

export default SocialAuthForm;
