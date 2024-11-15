import { ExperienceMenu } from "@/components/ExperienceMenu";
import Script from "next/script";

export default function Home() {
  
  return (
    <main className="h-screen min-h-screen">
      <Script src="/live2dcubismcore.js" strategy="beforeInteractive"/>
      <ExperienceMenu />
    </main>
  );
}
