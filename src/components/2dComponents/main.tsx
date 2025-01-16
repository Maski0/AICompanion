"use client";

// Import necessary libraries
import { useEffect, useState } from "react";
import { LAppDelegate } from "./lappdelegate";
import * as LAppDefine from "./lappdefine";
import { LAppGlManager } from "./lappglmanager";
import ChatBox from "./Chatbox";
import { Message } from "@/lib/types";
import { useSpeechHandler } from "./SpeechHandler";
import { LAppLive2DManager } from "./lapplive2dmanager";

const Live2DComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { generateSpeech, isLoading, error } = useSpeechHandler(
    "e0e10e6f-ff2b-0d4c-8011-1fc1eee7cb32"
  );
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    // Add the user's message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content, sender: "user" },
    ]);

    // Simulate bot response
    const response = await generateSpeech(content);
    if (response) {
      setMessages((prev) => [
        ...prev,
        {
          id: response.timestamp.toString(),
          content: response.text,
          sender: "bot",
          audioURL: response.audioUrl,
        },
      ]);
    }
    StartAudioLipSync(response.audioUrl);
  };
  // Function to validate and trigger TTS
  useEffect(() => {
    const live2dCanvas = document.getElementById("live2dCanvas");
    if (live2dCanvas) {
      if (live2dCanvas.style.display === "none") {
        live2dCanvas.style.display = "block";
      }
    }
  }, []);
  const StartAudioLipSync = (url: string) => {
    LAppLive2DManager.getInstance().startLiveLipSync(url);
  };
  const TestMotion = () => {
    console.log("````````");
    LAppLive2DManager.getInstance().TestMotion();
  };
  const canvascleanUp = () => {
    // Clean up canvas if needed
    const canvas = document.getElementById("live2dCanvas") as HTMLCanvasElement;
    if (canvas) {
      const gl = canvas.getContext("webgl2");
      console.log(gl);
    }
  };

  useEffect(() => {
    // Initialize WebGL and application instance
    const initializeApp = () => {
      if (
        !LAppGlManager.getInstance() ||
        !LAppDelegate.getInstance().initialize()
      ) {
        return;
      }
      LAppDelegate.getInstance().run();
    };

    // Directly initialize the app when the component mounts
    initializeApp();

    // Clean up before unloading
    window.addEventListener(
      "beforeunload",
      () => LAppDelegate.releaseInstance(),
      { passive: true }
    );

    // Handle window resize
    const handleResize = () => {
      if (LAppDefine.CanvasSize === "auto") {
        LAppDelegate.getInstance().onResize();
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener("beforeunload", () =>
        LAppDelegate.releaseInstance()
      );
      window.removeEventListener("resize", handleResize);
      //LAppDelegate.releaseInstance()
      canvascleanUp();
    };
  }, []);

  return (
    <>
      <canvas id="live2dCanvas" className="absolute inset-0 w-full h-full" />
      {/* <div className="z-10 md:justify-center fixed bottom-4 left-4 right-4 flex gap-3 flex-wrap justify-stretch">
        <div className="z-10 max-w-[600px] flex space-y-6 flex-col bg-gradient-to-tr  from-slate-300/30 via-gray-400/30 to-slate-600-400/30 p-4  backdrop-blur-md rounded-xl border-slate-100/30 border">
          <audio id="voice" />
          <div className="gap-3 flex">
            <input
              id="prompt"
              className="focus:outline focus:outline-white/80 flex-grow bg-slate-800/60 p-2 px-4 rounded-full text-white placeholder:text-white/50 shadow-inner shadow-slate-900/60"
              placeholder="type here.."
            />
            <button
              id="startTTS"
              className="bg-slate-100/20 p-2 px-6 rounded-full text-white"
              onClick={validateRequest}
            >
              Ask
            </button>
          </div>
        </div>
      </div> */}
      <div className="z-30">
        <audio id="voice" autoFocus/>
        <ChatBox messages={messages} onSendMessage={handleSendMessage} isloading= {isLoading}/>
        {error && <p className="text-red-500 text-sm px-4 py-2">{error}</p>}
        <button onClick={TestMotion}> Test Motion</button>
      </div>
    </>
  );
};

export default Live2DComponent;
