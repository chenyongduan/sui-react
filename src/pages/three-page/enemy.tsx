import { Ref } from "react";
import { useTexture } from "@react-three/drei";
import { MeshType } from "./style";

export function Enemy({ onRef }: { onRef: Ref<MeshType | undefined> }) {
  const monsterMap = useTexture("/monster.png");
  // const { nodes, materials } = useGLTF("/monster.glb");
  return (
    <mesh
      // @ts-ignore
      ref={onRef}
      position={[4, 2, 0]}
      // geometry={nodes.Body.geometry}
      // material={materials["材质"]}
    >
      <boxGeometry args={[6, 6, 0.001]} />
      <meshBasicMaterial map={monsterMap} transparent depthWrite={false} />
    </mesh>
  );
}
