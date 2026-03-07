"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AnswerSchema } from "@/lib/validations";

import { createAnswer } from "@/lib/actions/answer.action";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";

const Editor = dynamic(() => import("@/components/editor").then((mod) => mod.Editor), {
  ssr: false,
});

const AnswerForm = ({ questionId }: { questionId: string }) => {
  const [isAISubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleCreateAnswer = async (data: z.infer<typeof AnswerSchema>) => {
    startTransition(async () => {
      const result = await createAnswer({
        content: data.content,
        questionId: questionId,
      });
      if (!result.success) {
        toast.error("Error", {
          description: result.error?.message ?? "An error occurred while creating answer",
        });
        return;
      }

      toast.success("Success", {
        description: "Answer created successfully",
      });
      // reset form state
      form.reset();
    });
  };

  console.log(isPending);
  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="text-dark400_light800 paragraph-semibold">Write your answer here</h4>
        <Button
          disabled={isAISubmitting}
          type="submit"
          className="btn light-border-2 text-primary-500 dark:text-primary-500 gap-1.5 rounded-md border px-4 py-2.5 shadow-none"
        >
          {isAISubmitting ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              <span>Generating your answer...</span>
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt="Generate AI Answer"
                width={12}
                height={12}
                className="object-contain"
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>
      <Form {...form}>
        <form className="mt-6 flex w-full flex-col gap-10" onSubmit={form.handleSubmit(handleCreateAnswer)}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormControl>
                  <Editor editorRef={editorRef} markdown={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-16 flex justify-end">
            <Button disabled={isPending} type="submit" className="primary-gradient text-light-900! w-fit">
              {isPending ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  <span>Creating your answer...</span>
                </>
              ) : (
                <>
                  <span>Post Your Answer</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AnswerForm;
