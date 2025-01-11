"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Play, LoaderCircle } from "lucide-react";
import { Message } from "@/lib/types";
import { LAppLive2DManager } from "./lapplive2dmanager";

// Example message data structure

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isloading:boolean
}

export default function ChatBox({ messages, onSendMessage, isloading }: ChatBoxProps, ) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };
  const StartAudioLipSync = (url: string) => {
    LAppLive2DManager.getInstance().startLiveLipSync(url);
  };

  return (
    <div className="fixed bottom-4 right-20 w-full max-w-md mx-auto">
      <div className="border-slate-100/30 border rounded-lg shadow-lg">
        <div className="bg-gray-800 p-3">
          <h1 className="text-lg ">Chat Assistant</h1>
        </div>
        <div
          className="h-[300px] overflow-y-auto 
        [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:bg-neutral-700 
        p-4 space-y-4 bg-gradient-to-tr from-slate-300/60 via-gray-400/60 to-slate-600-400/60 backdrop-blur-md"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-black text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {message.content}
                {message.sender === "bot" && (
                  <button
                    onClick={() => StartAudioLipSync(message.audioURL)}
                    className="p-2 bg-blue-500 text-white rounded-full flex items-center justify-center shadow"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded px-2 py-1 text-black"
            />
            <button
              type="submit"
              disabled = {isloading}
              className="p-2 bg-blue-500 text-white rounded"
            >
              {isloading ? <LoaderCircle className="animate-spin w-4 h-4"/> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
