"use client";
import { Controller, DefaultValues, FieldValues, Path, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";
import { capitalize } from "@/lib/utils";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface AuthFormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues: T;
  formType: "sign-in" | "sign-up";
  onSubmit: (data: T) => Promise<ActionResponse>;
}

const AuthForm = <T extends FieldValues>({ schema, defaultValues, formType, onSubmit }: AuthFormProps<T>) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    resolver: standardSchemaResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = (await onSubmit(data)) as ActionResponse;

    if (!result.success) {
      toast.error("Error", {
        description: result.error?.message ?? "An error occurred while signing in",
      });
      return;
    }

    toast.success("Success", {
      description: formType === "sign-in" ? "Sign In successful" : "Sign Up successful",
    });
    router.push(ROUTES.HOME);
  };

  const buttonText = formType === "sign-in" ? "Sign In" : "Sign Up";
  return (
    <form id="form-rhf-demo" className="mt-10 space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        {Object.keys(defaultValues).map((field) => (
          <Controller
            key={field}
            name={field as Path<T>}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex w-full flex-col gap-2.5">
                <FieldLabel
                  className="paragraph-medium text-dark400_light700"
                  htmlFor={`"form-rhf-${formType}-${field.name}"`}
                >
                  {capitalize(field.name)}
                </FieldLabel>
                <Input
                  required
                  type={field.name === "password" ? "password" : "text"}
                  id={`"form-rhf-${formType}-${field.name}"`}
                  {...field}
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus rounded-1.5 min-h-12 border"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ))}
      </FieldGroup>
      <Button
        disabled={form.formState.isSubmitting}
        className="primary-gradient paragraph-medium rounded-2 font-inter text-light-900 min-h-12 w-full px-4 py-3 hover:cursor-pointer hover:shadow-lg"
      >
        {form.formState.isSubmitting ? (buttonText === "Sign In" ? "Signing In..." : "Signing Up...") : buttonText}
      </Button>
      {formType === "sign-in" ? (
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="paragraph-semibold primary-text-gradient">
            Sign Up
          </Link>
        </p>
      ) : (
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="paragraph-semibold primary-text-gradient">
            Sign In
          </Link>
        </p>
      )}
    </form>
  );
};

export default AuthForm;
