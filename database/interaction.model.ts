import { model, models, Schema, Types } from "mongoose";

export type TargetType = "question" | "answer";

export interface IInteraction {
  user: Types.ObjectId;
  action: string;
  actionType: TargetType;
  actionId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInteractionDoc extends IInteraction, Document {}
const InteractionSchema = new Schema<IInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      required: true,
    },
    actionType: { type: String, required: true, enum: ["question", "answer"] },
    actionId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const Interaction = models?.interaction || model<IInteraction>("Interaction", InteractionSchema);
export default Interaction;
