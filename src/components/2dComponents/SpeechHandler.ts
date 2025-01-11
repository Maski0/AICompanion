import { useState, useCallback } from "react";
import { parseMultipartMixed } from "./multipartHandler";
import { SpeechResponse } from "@/lib/types";
import { convertToWav } from "@/lib/converttowav";



export function useSpeechHandler(agentId: string, endpoint: string = "http://127.0.0.1:3000") {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSpeech = useCallback(
    async (inputText: string): Promise<SpeechResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!agentId) {
          throw new Error("Agent ID is required");
        }

        const response = await fetch(`${endpoint}/${agentId}/speaktext`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: inputText, roomId: "room-id", userId: "user-id" }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
        }

        const contentType = response.headers.get("content-type");

        if (!contentType) {
          throw new Error("No content type in response");
        }

        if (contentType.includes("multipart/mixed")) {
          const boundary = contentType.split("boundary=")[1];
          if (!boundary) {
            throw new Error("No boundary found in response");
          }

          const arrayBuffer = await response.arrayBuffer();
          const parts = parseMultipartMixed(arrayBuffer, boundary);

          const textDecoder = new TextDecoder();
          const textResponse = JSON.parse(textDecoder.decode(parts[0].body));
          const audioBlob = new Blob([parts[1].body], { type: "audio/mpeg" });

          const wavBlob = await convertToWav(audioBlob,44100);

          const audioUrl = URL.createObjectURL(wavBlob);

          return { text: textResponse.text, audioUrl, timestamp: Date.now() };
        } else {
          throw new Error("Unexpected content type");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error generating speech:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [agentId, endpoint]
  );

  return { generateSpeech, isLoading, error };
}
