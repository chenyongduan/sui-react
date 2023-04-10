import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { GameWorld } from "./game-world";

function App() {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} />
      <ambientLight intensity={0.5} />
      <spotLight
        position={[0, 15, 10]}
        angle={0.6}
        penumbra={1}
        intensity={1}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      {/* 背景 */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[1000, 1000]} />
        <meshPhongMaterial color="#87CEEB" />
      </mesh>
      {/* 地板 */}
      <mesh
        position={[0, -1, -1]}
        receiveShadow
        rotation={[-Math.PI / 3, 0, 0]}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshPhongMaterial color="#F5DEB3" />
      </mesh>
      <GameWorld />
    </Canvas>
  );
}

export default App;
