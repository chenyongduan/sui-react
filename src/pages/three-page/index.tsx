import { Ref, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SpringValue, a, useSpring } from "@react-spring/three";
import {
  OrbitControls,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { useGesture } from "@use-gesture/react";
import { mapRange, mapRangeMin } from "./utils";

type MeshType = THREE.Mesh<
  THREE.BufferGeometry,
  THREE.Material | THREE.Material[]
>;

function Arrow({ onRef }: { onRef: Ref<MeshType | undefined> }) {
  const spearMap = useTexture("/axe.png");
  return (
    // @ts-ignore
    <a.mesh ref={onRef}>
      <boxGeometry args={[1, 1, 0.001]} />
      <meshBasicMaterial map={spearMap} transparent depthWrite={false} />
    </a.mesh>
  );
}

function Enemy({ onRef }: { onRef: Ref<MeshType | undefined> }) {
  const monsterMap = useTexture("/monster.png");
  // const { nodes, materials } = useGLTF("/monster.glb");
  return (
    <mesh
      // @ts-ignore
      ref={onRef}
      position={[4, 1, 0]}
      // geometry={nodes.Body.geometry}
      // material={materials["材质"]}
    >
      <boxGeometry args={[4, 4, 0.001]} />
      <meshBasicMaterial map={monsterMap} transparent depthWrite={false} />
    </mesh>
  );
}

function Player({
  onRef,
  rotationZ,
}: {
  onRef: Ref<MeshType | undefined>;
  rotationZ: SpringValue<number>;
}) {
  const playerMap = useTexture("/player.png");
  return (
    // @ts-ignore
    <a.mesh ref={onRef} position={[-5, 0, -0.1]} rotation-z={rotationZ}>
      <boxGeometry args={[1, 2, 0]} />
      <meshBasicMaterial map={playerMap} transparent depthWrite={false} />
    </a.mesh>
  );
}

function PathDot({
  position,
  opacity,
}: {
  position: THREE.Vector3;
  opacity: number;
}) {
  return (
    <mesh position={position}>
      <circleGeometry args={[0.07]} />
      <meshBasicMaterial color="white" opacity={opacity} transparent />
    </mesh>
  );
}

function Path({ pathPoints }: { pathPoints: THREE.Vector3[] }) {
  return (
    <mesh>
      {pathPoints.map((point, index) => {
        return (
          <PathDot
            key={index}
            position={point}
            opacity={mapRange(index, 0, pathPoints.length, 1, 0.4)}
          />
        );
      })}
    </mesh>
  );
}

function World() {
  const worldRef = useRef<MeshType>();
  const arrowRef = useRef<MeshType>();
  const enemyRef = useRef<MeshType>();
  const playerRef = useRef<MeshType>();
  const checkCollisionRef = useRef(true);
  const arrowBox = new THREE.Box3();
  const enemyBoxRef = useRef(new THREE.Box3());
  const arrowListRef = useRef<any>([]);
  const setEnemyRef = useRef(false);
  const ARROW_ROTATION_Z = 0;
  const [pathPoints, setPathPoints] = useState<THREE.Vector3[]>([]);

  const [{ rotationZ, arrowRotationZ }, set] = useSpring(() => ({
    rotationZ: 0,
    arrowRotationZ: ARROW_ROTATION_Z,
  }));

  const [{ arrowX, arrowY }, arrowApi] = useSpring(() => ({
    arrowX: -5,
    arrowY: 1,
    config: {
      duration: 3000,
    },
  }));

  const bind = useGesture({
    onDrag: ({ down, movement }) => {
      let rotationZ = 0;
      let curArrowRotationZ = ARROW_ROTATION_Z;
      if (down) {
        const offsetX = movement[0];
        let playerRotation = 0;
        let arrowRotation = 0;
        if (offsetX > 0) {
          arrowRotation = -mapRangeMin(offsetX, 0, 20, 0, 1.2);
          playerRotation = mapRangeMin(offsetX, 0, 20, 0, 6);
        } else if (offsetX < 0) {
          arrowRotation = mapRangeMin(-offsetX, 0, 20, 0, 3);
        }
        rotationZ = Math.PI / (7 + playerRotation);
        curArrowRotationZ = -Math.PI / (3 + arrowRotation);
        refreshPathPoints();
        set({
          arrowRotationZ: curArrowRotationZ,
        });
      } else {
        setEnemyRef.current = true;
        checkCollisionRef.current = true;
        setPathPoints([]);
        arrowApi({
          to: pathPoints.map((value) => {
            return { arrowX: value.x, arrowY: value.y };
          }),
          config: {
            duration: 100,
            mass: 10,
            tension: 200,
          },
          onRest: () => {
            set.stop();
          },
        });
        set({
          to: {
            arrowRotationZ: -Math.PI * 2,
          },
          from: {
            arrowRotationZ: 0,
          },
          loop: true,
          config: {
            duration: 500,
          },
        });
      }
      set({
        rotationZ,
      });
    },
  });

  useFrame(() => {
    if (arrowRef.current) {
      arrowBox.setFromObject(arrowRef.current);
    }
    if (enemyRef.current && !setEnemyRef.current) {
      enemyBoxRef.current.setFromObject(enemyRef.current);
    }
    if (
      checkCollisionRef.current &&
      enemyBoxRef.current.intersectsBox(arrowBox)
    ) {
      console.log("=checkCollision=");
      checkCollisionRef.current = false;
      if (arrowRef.current) {
        const newArrow = arrowRef.current.clone(true);
        arrowRef.current.position.set(-2, 1, 0);
        enemyRef.current?.add(arrowRef.current);
        arrowListRef.current.push(arrowRef.current);

        newArrow?.rotation.set(0, 0, 0);
        set.stop();
        arrowApi.stop();
        if (arrowListRef.current.length > 5) {
          const cube = arrowListRef.current.shift();
          cube.removeFromParent();
        }

        newArrow.name = "newArrow";
        arrowRef.current = newArrow;
        arrowApi({ arrowX: -5, arrowY: 1, config: { duration: 10 } });
        worldRef.current?.add(arrowRef.current);
      }
    } else {
      arrowRef.current?.rotation.set(0, 0, arrowRotationZ.get());
      arrowRef.current?.position.set(arrowX.get(), arrowY.get(), 0);
    }
  });

  const refreshPathPoints = () => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 2, 0.1),
      new THREE.Vector3(-1, 3, 0.1),
      new THREE.Vector3(2, 2, 0.1),
    ]);
    const points = curve.getPoints(14);
    setPathPoints(points);
  };

  return (
    // @ts-ignore
    <a.mesh ref={worldRef} {...bind()}>
      <Enemy onRef={enemyRef} />
      <Player onRef={playerRef} rotationZ={rotationZ} />
      <Path pathPoints={pathPoints} />
      <Arrow onRef={arrowRef} />
    </a.mesh>
  );
}

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
      <World />
    </Canvas>
  );
}

export default App;
