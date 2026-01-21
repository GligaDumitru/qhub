"use client";
import AuthForm from "@/components/forms/AuthForm";
import { SignInSchema } from "@/lib/validations";

const SignIn = () => {
  return (
    <AuthForm
      schema={SignInSchema}
      defaultValues={{ email: "", password: "" }}
      formType="sign-in"
      onSubmit={async (data) => {
        console.log("SignIn", data);
      }}
    />
  );
};

export default SignIn;
