import { Ref, RefObject, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpring, a } from "@react-spring/three";
import { OrbitControls } from "@react-three/drei";

type MeshType = THREE.Mesh<
  THREE.BufferGeometry,
  THREE.Material | THREE.Material[]
>;

function Cube1({ onRef }: { onRef: Ref<MeshType | undefined> }) {
  return (
    <mesh ref={onRef} position={[-6, 0, 0]}>
      <boxGeometry args={[1.5, 0.05, 0.05]} />
      <meshBasicMaterial color={0xff0000} />
    </mesh>
  );
}

function Cube2({ onRef }: { onRef: Ref<MeshType | undefined> }) {
  return (
    <a.mesh ref={onRef} position={[0, 0, 0]}>
      <boxGeometry args={[1, 2, 1]} />
      <meshBasicMaterial color={0x00ff00} />
    </a.mesh>
  );
}

function World() {
  const worldRef = useRef<MeshType>();
  const cube1Ref = useRef<MeshType>();
  const cube2Ref = useRef<MeshType>();
  const checkCollisionRef = useRef(true);
  const cube1Box = new THREE.Box3();
  const cube2Box = new THREE.Box3();
  const setCube2Ref = useRef(true);
  const cubeListRef = useRef<any>([]);

  useFrame(() => {
    if (cube1Ref.current) {
      cube1Box.setFromObject(cube1Ref.current);
    }
    if (cube2Ref.current && setCube2Ref.current) {
      setCube2Ref.current = false;
      cube2Box.setFromObject(cube2Ref.current);
    }
    if (checkCollisionRef.current && cube2Box.intersectsBox(cube1Box)) {
      checkCollisionRef.current = false;
      if (cube1Ref.current) {
        console.log("Collision detected!", cube1Ref.current);
        const newCube = cube1Ref.current.clone(true);
        const center = new THREE.Vector3();
        cube2Box.getCenter(center);
        console.log("Collision detected! newCube=", center);
        cube1Ref.current.position.set(-1.25, cube1Ref.current.position.y, 0);
        cube2Ref.current?.add(cube1Ref.current);
        cubeListRef.current.push(cube1Ref.current);

        if (cubeListRef.current.length > 5) {
          const cube = cubeListRef.current.shift();
          cube.removeFromParent();
        }

        newCube.name = "newCube";
        cube1Ref.current = newCube;
        cube1Ref.current.position.x = -6;
        cube1Ref.current.position.y = Math.random();
        worldRef.current?.add(cube1Ref.current);
        checkCollisionRef.current = true;
      }
    } else {
      if (cube1Ref.current && checkCollisionRef.current) {
        cube1Ref.current.position.x += 0.04;
      }
    }
  });

  return (
    <mesh ref={worldRef}>
      <Cube1 onRef={cube1Ref} />
      <Cube2 onRef={cube2Ref} />
    </mesh>
  );
}

function App() {
  return (
    <Canvas>
      <OrbitControls />
      <World />
    </Canvas>
  );
}

export default App;
