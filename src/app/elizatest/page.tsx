'use client'

import React, { useState } from "react";
import { useSpeechHandler } from "@/components/2dComponents/SpeechHandler";

interface Message {
  sender: "user" | "bot";
  text: string;
  audioUrl?: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { generateSpeech, isLoading, error } = useSpeechHandler("e0e10e6f-ff2b-0d4c-8011-1fc1eee7cb32");

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to history
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    const response = await generateSpeech(input);
    if (response) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.text, audioUrl: response.audioUrl },
      ]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto border-b h-96">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p>{msg.text}</p>
              {msg.audioUrl && (
                <audio controls className="mt-2 w-full">
                  <source src={msg.audioUrl} type="audio/mpeg" />
                </audio>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 flex items-center space-x-2 border-t">
        <input
          type="text"
          className="flex-1 px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Processing..." : "Send"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm px-4 py-2">{error}</p>}
    </div>
  );
}
