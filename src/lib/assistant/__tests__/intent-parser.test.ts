// Production-safe test file - removing @ts-nocheck for type safety

import { describe, it, expect, vi } from "vitest";

// Mock the OpenAI SDK so the tests do not make network calls
vi.mock("openai", () => {
  // A minimal fake implementation that returns canned responses based on the
  // presence of the `response_format` argument (used by the intent parser).
  return {
    OpenAI: vi.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: vi.fn().mockImplementation((args: any) => {
              // If the caller requested a JSON response (intent-parser)
              if (args?.response_format?.type === "json_object") {
                return Promise.resolve({
                  choices: [
                    {
                      message: {
                        content: JSON.stringify({
                          intent: "sales_report",
                          entities: { startDate: "2024-01-01" },
                        }),
                      },
                    },
                  ],
                });
              }

              // Fallback: generic answer for AssistantService.ask()
              return Promise.resolve({
                choices: [
                  {
                    message: {
                      content:
                        "Here is a mocked answer based on the provided context.",
                    },
                  },
                ],
              });
            }),
          },
        },
      };
    }),
  };
});

// Dynamically import after mocking so the modules receive the mocked OpenAI
const { parseIntent } = await import("../nlp/intent-parser.ts");
const { ask } = await import("../assistant-service.ts");

describe("intent-parser", () => {
  it("should extract intent and entities from a question", async () => {
    const result = await parseIntent(
      "How many orders did we get since 2024-01-01?"
    );

    expect(result.intent).toBe("sales_report");
    expect(result.entities).toEqual({ startDate: "2024-01-01" });
  });
});

describe("assistant-service", () => {
  it("should return an answer and sources", async () => {
    const result = await ask("Give me a quick sales overview for 2024-01-01.");

    expect(result.answer).toBeTypeOf("string");
    expect(result.sources).toBeInstanceOf(Array);
  });
});
