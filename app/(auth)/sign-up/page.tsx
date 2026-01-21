"use client";
import AuthForm from "@/components/forms/AuthForm";
import { SignUpSchema } from "@/lib/validations";

const SignUp = () => {
  return (
    <AuthForm
      schema={SignUpSchema}
      defaultValues={{ username: "", name: "", email: "", password: "" }}
      formType="sign-up"
      onSubmit={async (data) => {
        console.log("SignUp", data);
      }}
    />
  );
};

export default SignUp;
