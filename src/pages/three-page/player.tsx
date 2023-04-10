import { Ref } from "react";
import { SpringValue, a } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { MeshType } from "./style";

type Props = {
  onRef: Ref<MeshType | undefined>;
  rotationZ: SpringValue<number>;
};

export function Player({ onRef, rotationZ }: Props) {
  const playerMap = useTexture("/player.png");
  return (
    // @ts-ignore
    <a.mesh ref={onRef} position={[-5, 0, -0.1]} rotation-z={rotationZ}>
      <boxGeometry args={[1, 2, 0]} />
      <meshBasicMaterial map={playerMap} transparent depthWrite={false} />
    </a.mesh>
  );
}
