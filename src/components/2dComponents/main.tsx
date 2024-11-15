"use client";

// Import necessary libraries
import { useEffect } from "react";
import { LAppDelegate } from "./lappdelegate";
import * as LAppDefine from "./lappdefine";
import { LAppGlManager } from "./lappglmanager";

const Live2DComponent = () => {
  // Function to validate and trigger TTS

  const validateRequest = () => {
    LAppDelegate.getInstance().startVoiceRelayTTS();
  };

  const canvascleanUp = () => {
    // Clean up canvas if needed
    const canvas = document.getElementById("live2dCanvas") as HTMLCanvasElement;
    if (canvas) {
      const gl = canvas.getContext("webgl2");
      console.log(gl);
      console.log("First in if !!!");
      // if (gl) {
      //   console.log("in GL !!!");
      //   // Lose WebGL context
      //   gl.getExtension("WEBGL_lose_context")?.loseContext();
        
      //   // Clear canvas
      //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
      //   // Reset canvas dimensions
      //   canvas.width = 0;
      //   canvas.height = 0;
      // }
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

      // const submitButton = document.getElementById("startTTS");
      // submitButton?.addEventListener("click", validateRequest);

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
      <div className="z-10 md:justify-center fixed bottom-4 left-4 right-4 flex gap-3 flex-wrap justify-stretch">
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
      </div>
    </>
  );
};

export default Live2DComponent;
