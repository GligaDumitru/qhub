"use client";
import AuthForm from "@/components/forms/AuthForm";
import { signInWithCredentials } from "@/lib/actions/auth.action";
import { SignInSchema } from "@/lib/validations";

const SignIn = () => {
  return (
    <AuthForm
      schema={SignInSchema}
      defaultValues={{ email: "demo@gmail.com", password: "Password1." }}
      formType="sign-in"
      onSubmit={signInWithCredentials}
    />
  );
};

export default SignIn;
