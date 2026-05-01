"use client";

import { toggleSaveQuestion } from "@/lib/actions/collection.action";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { use, useState } from "react";
import { toast } from "sonner";

const SaveQuestion = ({
  questionId,
  hasSavedQuestionPromise,
}: {
  questionId: string;
  hasSavedQuestionPromise: Promise<ActionResponse<{ saved: boolean }>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const userId = session.data?.user?.id;

  const { data } = use(hasSavedQuestionPromise);
  const { saved } = data || {};

  const handleSave = async () => {
    if (isLoading) return;

    if (!userId) {
      return toast.error("Error", {
        description: "You must be logged in to save a question",
      });
    }

    setIsLoading(true);

    try {
      const result = await toggleSaveQuestion({ questionId });
      if (!result.success) {
        throw new Error(result.error?.message || "An error occurred while saving the question");
      }

      toast.success("Success", {
        description: result.data?.saved ? "Question saved successfully" : "Question removed from saved questions",
      });
    } catch (error) {
      return toast.error("Error", {
        description: error instanceof Error ? error.message : "An error occurred while saving the question",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Image
      src={saved ? `/icons/star-filled.svg` : `/icons/star-red.svg`}
      alt="save"
      width={18}
      height={18}
      className={`cursor-pointer ${isLoading && "opacity-50"}`}
      aria-label="save"
      onClick={handleSave}
    />
  );
};

export default SaveQuestion;
