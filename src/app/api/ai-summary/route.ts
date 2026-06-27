import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const { prompt, context } = await request.json();

  if (!apiKey) {
    return NextResponse.json({ summary: "" }, { status: 200 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      system: `You are AgentPay Copilot. Use only this CSV-derived context.\n${context}`,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ summary: "" }, { status: 200 });
  }

  const data = await response.json();
  const summary = data.content?.map((part: { text?: string }) => part.text).filter(Boolean).join("\n") ?? "";
  return NextResponse.json({ summary });
}
