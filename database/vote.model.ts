import { model, models, Schema, Types } from "mongoose";

export type ContentType = "question" | "answer";
export type VoteType = "upvote" | "downvote";

export interface IVote {
  author: Types.ObjectId;
  id: Types.ObjectId;
  type: ContentType;
  voteType: VoteType;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    id: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      required: true,
      enum: ["question", "answer"],
    },
    voteType: {
      type: String,
      required: true,
      enum: ["upvote", "downvote"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate votes: one vote per user per content
VoteSchema.index({ author: 1, id: 1 }, { unique: true });

const Vote = models?.vote || model<IVote>("Vote", VoteSchema);
export default Vote;
