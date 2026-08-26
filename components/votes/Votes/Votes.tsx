"use client";
import { createVote } from "@/lib/actions/vote.action";
import { formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { use, useState } from "react";
import { toast } from "sonner";

interface VotesProps {
  upvotes: number;
  downvotes: number;
  hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
  targetId: string;
  targetType: "question" | "answer";
}

const Votes = ({ upvotes, downvotes, hasVotedPromise, targetId, targetType }: VotesProps) => {
  const session = useSession();
  const userId = session.data?.user?.id;

  const [isLoading, setIsLoading] = useState(false);

  const { success, data } = use(hasVotedPromise);

  const { hasUpvoted, hasDownvoted } = data || {};

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!userId) {
      return toast.error("Error", {
        description: "You must be logged in to vote",
      });
    }

    setIsLoading(true);

    try {
      const result = await createVote({ targetId, targetType, voteType: type });
      if (!result.success) {
        toast.error("Error", {
          description: result.error?.message || "An error occurred while voting",
        });
        return;
      }

      const successMessage =
        type === "upvote"
          ? `Upvoted ${!hasUpvoted ? "added" : "removed"} successfully`
          : `Downvoted ${!hasDownvoted ? "added" : "removed"} successfully`;

      toast.success("Success", {
        description: successMessage,
      });
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "An error occurred while voting",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={success && hasUpvoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          alt="upvote"
          width={18}
          height={18}
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="upvote"
          onClick={() => !isLoading && handleVote("upvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="text-dark400_light900 subtle-medium">{formatNumber(upvotes)}</p>
        </div>
      </div>
      <div className="flex-center gap-1.5">
        <Image
          src={success && hasDownvoted ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
          alt="downvote"
          width={18}
          height={18}
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="downvote"
          onClick={() => !isLoading && handleVote("downvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="text-dark400_light900 subtle-medium">{formatNumber(downvotes)}</p>
        </div>
      </div>
    </div>
  );
};

export default Votes;
