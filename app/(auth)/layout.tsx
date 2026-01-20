import SocialAuthForm from "@/components/forms/SocialAuthForm";
import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex-center bg-auth-light dark:bg-auth-dark min-h-screen bg-cover bg-center bg-no-repeat px-4 py-10">
      <section className="light-border background-light800_dark200 shadow-light100_dark100 min-w-full rounded-[10px] border px-4 py-10 shadow-md sm:min-w-[520px] sm:px-8">
        <div className="flex-between">
          <div className="space-y-2.5">
            <h1 className="h2-bold text-dark100_light900">Join QHub</h1>
            <p className="paragraph-regular text-dark500_light400">To get your questions answered.</p>
          </div>
          <Image src="/images/site-logo.svg" alt="QHub Logo" width={50} height={50} className="object-contain" />
        </div>
        {children}
        <SocialAuthForm />
      </section>
    </main>
  );
};

export default AuthLayout;
