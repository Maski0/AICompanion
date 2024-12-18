"use client";
import { ExperienceMenu } from "@/components/ExperienceMenu";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if (window.location.pathname == "/") {
      const live2dCanvas = document.getElementById("live2dCanvas");
      if (live2dCanvas) {
        live2dCanvas.style.display = "none";
      }
    }
  }, []);
  return (
    <main className="h-screen min-h-screen">
      <ExperienceMenu />
    </main>
  );
}
