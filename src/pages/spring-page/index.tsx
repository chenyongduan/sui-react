import { useSpring, a } from "@react-spring/three";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

function BoxRotation() {
  const ref = useRef();

  const [{ rotationZ }, api] = useSpring(() => ({
    from: { rotationZ: 0 },
    to: { rotationZ: -Math.PI * 2 },
    loop: true,
    config: {
      duration: 2000,
    },
    onRest: () => {
      console.log("on reset");
      // setTimeout(() => {
      //   api.start();
      // }, 500);
    },
    onPause: () => {
      console.log("on pause");
      setTimeout(() => {
        api.resume();
      }, 1000);
    },
  }));

  useEffect(() => {
    // setTimeout(() => {
    //   api.stop();
    // }, 500);
  }, []);

  useFrame(() => {
    console.log(rotationZ.get());
  });

  return (
    <a.mesh ref={ref} rotation-z={rotationZ}>
      <boxGeometry args={[1, 2, 1]} />
      <meshBasicMaterial color="red" />
    </a.mesh>
  );
}

export default function App() {
  return (
    <div style={{ height: "100%" }}>
      <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
        <OrbitControls />
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
        {/* 背景 */}
        <mesh position={[0, 0, -2]}>
          <planeGeometry args={[1000, 1000]} />
          <meshPhongMaterial color="#87CEEB" />
        </mesh>
        <BoxRotation />
      </Canvas>
    </div>
  );
}
