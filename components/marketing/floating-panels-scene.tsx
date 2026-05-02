"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    position: [-2.2, 3.5, 0.5],
    rotation: [-0.12, 0.22, -0.06],
    scale: [12.0, 9.0, 0.15],
    delay: 0,
    tint: "#F0E7D5"
  },
  {
    position: [3.2, 0.8, -1.5],
    rotation: [0.08, -0.18, 0.04],
    scale: [14.0, 10.0, 0.15],
    delay: 1.3,
    tint: "#FBF6EC"
  },
  {
    position: [0, -4.5, 1.0],
    rotation: [0.15, 0.08, 0.07],
    scale: [16.0, 8.5, 0.15],
    delay: 2.2,
    tint: "#FDF2E0"
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

const mouse = { x: 0, y: 0 };

function FloatingPanel({ delay, position, rotation, scale, tint }: PanelSpec) {
  const groupRef = useRef<THREE.Group | null>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const t = clock.elapsedTime + delay;
    const px = mouse.x;
    const py = mouse.y;

    group.position.set(
      position[0] + px * 1.5,
      position[1] + Math.sin(t * 0.62) * 0.35 + py * 0.9,
      position[2]
    );
    group.rotation.set(
      rotation[0] + Math.sin(t * 0.42) * 0.08,
      rotation[1] + px * 0.65 + Math.cos(t * 0.34) * 0.12,
      rotation[2] + Math.sin(t * 0.36) * 0.05
    );
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={tint}
          emissive="#FFF8ED"
          emissiveIntensity={0.08}
          metalness={0.04}
          roughness={0.82}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#B48232" opacity={0.32} transparent />
      </lineSegments>
      <mesh position={[-0.28, 0.18, 0.54]} scale={[0.32, 0.035, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color="#B48232" emissive="#E0A842" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0.18, 0.18, 0.54]} scale={[0.52, 0.028, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color="#8A826E" />
      </mesh>
      <mesh position={[-0.16, -0.1, 0.54]} scale={[0.68, 0.025, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color="#5C5544" />
      </mesh>
      <mesh position={[0.08, -0.25, 0.54]} scale={[0.42, 0.025, 0.018]}>
        <boxGeometry />
        <meshStandardMaterial color="#5C5544" />
      </mesh>
    </group>
  );
}

function PanelScene() {
  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight color="#FFF8ED" intensity={1.6} position={[2.6, 3.2, 4.8]} />
      <directionalLight color="#D4CFC2" intensity={0.55} position={[-3, -2, 3]} />
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
    <div className="relative min-h-[900px] overflow-hidden p-6">
      <div className="relative mx-auto grid min-h-[400px] max-w-[720px] content-center gap-6">
        {["Client room", "Approval queue", "Delivery memory"].map((label, index) => (
          <div
            className="surface-panel p-6"
            key={label}
            style={{ transform: `translateX(${index === 1 ? 40 : index === 2 ? -22 : 0}px)` }}
          >
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{label}</p>
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

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
      className="relative min-h-[900px]"
      ref={containerRef}
    >
      <Canvas
        camera={{ fov: 42, position: [0, 0, 24] }}
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
      >
        <PanelScene />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,var(--bg-void)_80%)]" />
    </div>
  );
}
