import { useTexture, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, useBox, usePlane, useLine, Debug } from "@react-three/p2";
import { Button } from "antd";
import { Ref, useCallback, useEffect, useState } from "react";
import { BufferGeometry, Material, Mesh } from "three";

type MeshRef = Ref<Mesh<BufferGeometry, Material | Material[]>>;

function Arrow({ reset }: { reset: boolean }) {
  const [ref, api] = useLine(() => ({
    type: "Dynamic",
    args: [1],
    mass: 1,
  }));

  useEffect(() => {
    api.position.set(0, 5);
    api.velocity.set(0, 0);
  }, [reset]);

  return (
    <mesh
      ref={ref as MeshRef}
      name="arrow"
      onPointerEnter={() => {
        // api.angle.set(20);
      }}
      onPointerDown={() => {
        api.velocity.set(20, 20);
      }}
    >
      <boxGeometry args={[2, 0.2, 0.1]} />
      <meshStandardMaterial color={"blue"} />
    </mesh>
  );
}

function Enemy({ reset }: { reset: boolean }) {
  const [ref, api] = useBox(() => ({
    type: "Dynamic",
    mass: 1,
    args: [5, 5],
    // position: [0, 0],
    onCollide: (e) => {
      console.log("Enemy=", e);
    },
  }));

  useEffect(() => {
    api.position.set(0, 0);
    // api.velocity.set(0, 5);
  }, [reset]);

  return (
    <mesh ref={ref as MeshRef} name="enemy">
      <boxGeometry args={[5, 5, 1]} />
      <meshStandardMaterial color={"hotpink"} />
    </mesh>
  );
}

function Floor() {
  const [ref, api] = usePlane(() => ({
    type: "Static",
    position: [0, -7],
    onCollideBegin: (e) => {
      // e.body.position.set(0, 0, 0);
    },
  }));

  return <mesh ref={ref as MeshRef} name="floor" />;
}

export default function App() {
  const [reset, setReset] = useState(false);

  const onResetClick = useCallback(() => {
    setReset((value) => !value);
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <spotLight
          position={[0, 10, 10]}
          angle={0.4}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <Physics
          maxSubSteps={20}
          gravity={[0, -40]}
          normalIndex={2}
          defaultContactMaterial={{
            friction: 1,
            restitution: 0.7,
            stiffness: 1e7,
            relaxation: 1,
            frictionStiffness: 1e7,
            frictionRelaxation: 2,
          }}
        >
          <mesh position={[0, 0, -1]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshPhongMaterial color="#374037" />
          </mesh>
          {/* @ts-ignore */}
          <Debug scale={1.1} linewidth={0} normalIndex={2}>
            <Floor />
            <Arrow reset={reset} />
            <Enemy reset={reset} />
          </Debug>
        </Physics>
        <Html position={[-10, 5, 0]}>
          <Button onClick={onResetClick}>重置</Button>
        </Html>
      </Canvas>
    </div>
  );
}
