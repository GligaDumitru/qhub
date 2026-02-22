import { Schema, model, models } from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ITemplate {}

const TemplateSchema = new Schema<ITemplate>({}, { timestamps: true });

const Template = models?.Template || model<ITemplate>("Template", TemplateSchema);
export default Template;
