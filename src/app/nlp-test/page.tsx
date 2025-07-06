"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleNLPProcessor } from "@/lib/assistant/nlp/simple-nlp-processor";

export default function NLPTestPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const testNLP = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Test direct NLP processing zonder AI framework
      const processor = new SimpleNLPProcessor("en");

      const nlpResult = processor.processCommand(input.trim());
      setResult(nlpResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }

    setIsProcessing(false);
  };

  const testCommands = [
    "Show me sales dashboard",
    "Go to customer analytics",
    "Open revenue reports",
    "Ga naar klanten overzicht",
    "Toon verkoop cijfers",
  ];

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>NLP Processor Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter navigation command..."
              onKeyDown={e => e.key === "Enter" && testNLP()}
            />
            <Button onClick={testNLP} disabled={isProcessing || !input.trim()}>
              {isProcessing ? "Processing..." : "Test"}
            </Button>
          </div>

          {/* Test Commands */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test Commands:</h3>
            <div className="grid grid-cols-1 gap-2">
              {testCommands.map((cmd, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(cmd)}
                  className="justify-start"
                >
                  {cmd}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="space-y-3">
              <h3 className="font-semibold">Result:</h3>
              <div className="p-3 bg-gray-50 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
