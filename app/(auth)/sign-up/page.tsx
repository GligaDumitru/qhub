"use client";
import AuthForm from "@/components/forms/AuthForm";
import { signUpWithCredentials } from "@/lib/actions/auth.action";
import { SignUpSchema } from "@/lib/validations";

const SignUp = () => {
  return (
    <AuthForm
      schema={SignUpSchema}
      defaultValues={{ username: "", name: "", email: "", password: "" }}
      formType="sign-up"
      onSubmit={signUpWithCredentials}
    />
  );
};

export default SignUp;
