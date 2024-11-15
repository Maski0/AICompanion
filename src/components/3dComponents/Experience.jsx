"use client";
import { useAITeacher } from "@/hooks/useAITeacher";
import {
  CameraControls,
  Environment,
  Float,
  Gltf,
  Html,
  Loader,
  MeshReflectorMaterial,
  Stats,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva, button, useControls } from "leva";
import { Suspense, useEffect, useRef, useState } from "react";
import { degToRad } from "three/src/math/MathUtils";
import { BoardSettings } from "./BoardSettings";
import { MessagesList } from "./MessagesList";
import { Teacher } from "./Teacher";
import { TypingBox } from "./TypingBox";
import { Settings } from "lucide-react";

const itemPlacement = {
  floor: {
    position: [0.2, -1.7, -2],
  },
  charater: {
    position: [-1, -1.7, -3],
  },
  board: {
    position: [0.45, 0.382, -6],
  },
};

export const Experience3D = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customSystemprompt, setCustomSystemprompt] = useState("");
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const teacher = useAITeacher((state) => state.teacher);
  return (
    <>
      <div
        className={`transition-all relative duration-300 h-full w-full ${isSettingsOpen ? "blur-sm" : ""}`}
      >
        <button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={openSettings}
          aria-label="Open Settings"
        >
          <Settings className="h-10 w-10" />
        </button>
        <div className="z-10 md:justify-center fixed bottom-4 left-4 right-4 flex gap-3 flex-wrap justify-stretch">
          <TypingBox CustomSystemPrompt={customSystemprompt} />
        </div>
        <Leva hidden />
        <Loader />
        <Canvas
          camera={{
            position: [0, 0, 0.0001],
          }}
          shadows
        >
          <color attach="background" args={["#171720"]} />
          <fog attach="fog" args={["#171720", 60, 90]} />
          <CameraManager />
          {/* <pointLight position={[-1, 1, -3]} intensity={5} /> */}
          <Stats />
          <Suspense>
            <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
              <Html transform {...itemPlacement.board} distanceFactor={1}>
                <MessagesList />
                {/* <BoardSettings /> */}
              </Html>
              <Environment preset="sunset" />
              <ambientLight intensity={0.8} color="pink" />

              <Teacher
                teacher={teacher}
                key={teacher}
                {...itemPlacement.charater}
                scale={1.5}
                rotation-y={degToRad(20)}
              />
              <Floor rotation={[-Math.PI / 2, 0, 0]} {...itemPlacement.floor} />
            </Float>
          </Suspense>
        </Canvas>
      </div>
      {/* Settings Popup */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-[#393949] p-6 rounded-lg shadow-lg w-full max-w-md"
            role="dialog"
            aria-labelledby="settings-title"
          >
            <h2 id="settings-title" className="text-2xl font-bold mb-4">
              Settings
            </h2>
            <p className="font-bold mb-4">Set the Custom System Prompt.</p>
            <textarea
              placeholder="Type your paragraph here..."
              value={customSystemprompt}
              onChange={(e) => setCustomSystemprompt(e.target.value)}
              className="w-full h-32 mb-4  bg-slate-800/60"
            />
            <div className="flex justify-end">
              <button
                className="bg-slate-100/20 p-2 px-6 rounded-full text-white"
                onClick={closeSettings}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CAMERA_POSITIONS = {
  default: [0, 6.123233995736766e-21, 0.0001],
  loading: [
    0.00002621880610890309, 0.00000515037441056466, 0.00009636414192870058,
  ],
  speaking: [0, -1.6481333940859815e-7, 0.00009999846226827279],
};

const CAMERA_ZOOMS = {
  default: 1,
  loading: 1.3,
  speaking: 2.1204819420055387,
};

const CameraManager = () => {
  const controls = useRef();
  const loading = useAITeacher((state) => state.loading);
  const currentMessage = useAITeacher((state) => state.currentMessage);

  useEffect(() => {
    if (loading) {
      controls.current?.setPosition(...CAMERA_POSITIONS.loading, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.loading, true);
    } else if (currentMessage) {
      controls.current?.setPosition(...CAMERA_POSITIONS.speaking, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.speaking, true);
    }
  }, [loading]);

  useControls("Helper", {
    getCameraPosition: button(() => {
      const position = controls.current.getPosition();
      const zoom = controls.current.camera.zoom;
      console.log([...position], zoom);
    }),
  });

  return (
    <CameraControls
      ref={controls}
      minZoom={1}
      maxZoom={3}
      polarRotateSpeed={-0.3} // REVERSE FOR NATURAL EFFECT
      azimuthRotateSpeed={-0.3} // REVERSE FOR NATURAL EFFECT
      mouseButtons={{
        left: 1, //ACTION.ROTATE
        wheel: 16, //ACTION.ZOOM
      }}
      touches={{
        one: 32, //ACTION.TOUCH_ROTATE
        two: 512, //ACTION.TOUCH_ZOOM
      }}
    />
  );
};
function Floor(props) {
  return (
    <mesh receiveShadow {...props}>
      <planeGeometry args={[20, 10]} />
      <MeshReflectorMaterial
        color="#878790"
        blur={[400, 400]}
        resolution={1024}
        mixBlur={1}
        mixStrength={3}
        depthScale={1}
        minDepthThreshold={0.85}
        metalness={0}
        roughness={1}
      />
    </mesh>
  );
}

useGLTF.preload("/models/classroom_default.glb");
useGLTF.preload("/models/classroom_alternative.glb");
