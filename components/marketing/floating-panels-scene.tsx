"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type PanelSpec = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  delay: number;
  tint: string;
};

const panels: PanelSpec[] = [
  {
    position: [-1.9, 0.95, 0],
    rotation: [-0.12, 0.22, -0.06],
    scale: [2.1, 1.12, 0.05],
    delay: 0,
    tint: "#18181B"
  },
  {
    position: [1.05, 0.32, -0.45],
    rotation: [0.08, -0.18, 0.04],
    scale: [2.45, 1.2, 0.05],
    delay: 1.3,
    tint: "#111113"
  },
  {
    position: [-0.55, -1.02, 0.25],
    rotation: [0.15, 0.08, 0.07],
    scale: [2.72, 1.08, 0.05],
    delay: 2.2,
    tint: "#1F1F23"
  }
];

function hasWebGLSupport() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function FloatingPanel({ delay, position, rotation, scale, tint }: PanelSpec) {
  const groupRef = useRef<THREE.Group | null>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useFrame(({ clock, pointer }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const t = clock.elapsedTime + delay;
    group.position.set(
      position[0] + pointer.x * 0.08,
      position[1] + Math.sin(t * 0.72) * 0.08 + pointer.y * 0.04,
      position[2]
    );
    group.rotation.set(
      rotation[0] + Math.sin(t * 0.46) * 0.025,
      rotation[1] + pointer.x * 0.07 + Math.cos(t * 0.38) * 0.035,
      rotation[2] + Math.sin(t * 0.4) * 0.018
    );
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={tint}
          emissive="#0A0A0B"
          metalness={0.12}
          roughness={0.78}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#D4AF37" opacity={0.28} transparent />
      </lineSegments>
      <mesh position={[-0.28, 0.18, 0.54]} scale={[0.32, 0.035, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color="#D4AF37" emissive="#8A6F2E" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0.18, 0.18, 0.54]} scale={[0.52, 0.028, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color="#5C5A56" />
      </mesh>
      <mesh position={[-0.16, -0.1, 0.54]} scale={[0.68, 0.025, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color="#2E2D2A" />
      </mesh>
      <mesh position={[0.08, -0.25, 0.54]} scale={[0.42, 0.025, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color="#2E2D2A" />
      </mesh>
    </group>
  );
}

function PanelScene() {
  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight color="#F5DFA0" intensity={1.4} position={[2.6, 3.2, 4.8]} />
      <directionalLight color="#A09E99" intensity={0.5} position={[-3, -2, 3]} />
      <group rotation={[0.02, -0.14, 0]}>
        {panels.map((panel) => (
          <FloatingPanel key={`${panel.position.join("-")}-${panel.delay}`} {...panel} />
        ))}
      </group>
    </>
  );
}

function StaticFallback() {
  return (
    <div className="lux-panel relative min-h-[420px] overflow-hidden p-6">
      <div className="absolute inset-0 lux-grid opacity-20" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[360px] max-w-[620px] content-center gap-4">
        {["Client room", "Approval queue", "Delivery memory"].map((label, index) => (
          <div
            className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-5 shadow-[var(--shadow-sm)]"
            key={label}
            style={{ transform: `translateX(${index === 1 ? 34 : index === 2 ? -18 : 0}px)` }}
          >
            <p className="lux-meta">{label}</p>
            <div className="mt-5 h-1.5 w-24 rounded-full bg-[var(--gold-500)]" />
            <div className="mt-4 grid gap-2">
              <div className="h-2 rounded-full bg-[var(--ink-ghost)]" />
              <div className="h-2 w-2/3 rounded-full bg-[var(--ink-ghost)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FloatingPanelsScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setSupported(hasWebGLSupport());
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (supported === false) {
    return <StaticFallback />;
  }

  return (
    <div
      className="lux-panel relative min-h-[420px] overflow-hidden"
      ref={containerRef}
    >
      <div className="absolute inset-0 lux-grid opacity-20" aria-hidden="true" />
      <Canvas
        camera={{ fov: 38, position: [0, 0, 6.4] }}
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
      >
        <PanelScene />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,var(--bg-surface))]" />
    </div>
  );
}
