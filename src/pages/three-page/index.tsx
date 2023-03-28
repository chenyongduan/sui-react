import * as THREE from "three";
import { useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { Ring } from "@react-three/drei";
import React from "react";
import { Mesh } from "three";

function Box(props: ThreeElements["mesh"]) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useFrame((state, delta) => {
    mesh.current.rotation.x += delta;
  });

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function useTurntable() {
  const ref = React.useRef<Mesh>(null!);

  useFrame(() => {
    ref.current.rotation.x += 0.02;
  });

  return ref;
}

function Story({ args }: { args?: any }) {
  const ref = useTurntable();

  return (
    <Ring ref={ref} args={args}>
      <meshPhysicalMaterial color="#ff0000" wireframe wireframeLinewidth={10} />
    </Ring>
  );
}

const ThreePage = () => {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 2, 0]} />
      <Box position={[1.2, 0, 0]} />
      <Story />
    </Canvas>
  );
};

export default ThreePage;
