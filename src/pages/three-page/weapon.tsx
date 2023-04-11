import { Ref } from "react";
import { useTexture } from "@react-three/drei";
import { a } from "@react-spring/three";
import { MeshType } from "./style";

export function Weapon({ onRef }: { onRef: Ref<MeshType | undefined> }) {
  const spearMap = useTexture("/axe.png");
  return (
    // @ts-ignore
    <a.mesh ref={onRef}>
      <boxGeometry args={[0.8, 0.8, 0.001]} />
      <meshBasicMaterial map={spearMap} transparent depthWrite={false} />
      <mesh position={[0, 0, 0.001]}>
        <boxGeometry args={[0.1, 0.1, 0]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </a.mesh>
  );
}
