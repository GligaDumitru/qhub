import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { AIAnswerSchema } from "@/lib/validations";
import { createOllama } from "ollama-ai-provider-v2";

import { generateText } from "ai";
import { NextResponse } from "next/server";
import z from "zod";

const ollama = createOllama({
  baseURL: "https://ollama.com/api",
  ...(process.env.OLLAMA_API_KEY && {
    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
    },
  }),
});

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const validatedData = AIAnswerSchema.safeParse(body);
    if (!validatedData.success) {
      const flattened = z.flattenError(validatedData.error);
      throw new ValidationError(flattened.fieldErrors);
    }

    const { question, content } = validatedData.data;

    const { text } = await generateText({
      model: ollama("gpt-oss:120b"),
      providerOptions: { ollama: { think: false } },
      prompt: `Generate a markdown-formatted response to the following question: ${question}. Base it on the provided content: ${content}`,
      system:
        "You are a helpful assistant that provides informative responses in markdown format. Use appropriate markdown syntax for headings, lists, code blocks, and emphasis where necessary. For code blocks, use short-form smaller case language identifiers (e.g., 'js' for JavaScript, 'py' for Python, 'ts' for TypeScript, 'html' for HTML, 'css' for CSS, etc.).",
    });

    console.log("text", text);

    return NextResponse.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    console.error(error);
    return handleError(error, "api") as APIErrorResponse;
  }
}
