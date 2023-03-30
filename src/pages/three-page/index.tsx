import { Ref, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SpringValue, a, useSpring } from "@react-spring/three";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import { useGesture } from "@use-gesture/react";

type MeshType = THREE.Mesh<
  THREE.BufferGeometry,
  THREE.Material | THREE.Material[]
>;

function Arrow({ onRef }: { onRef: Ref<MeshType | undefined> }) {
  const spearMap = useTexture("/spear.png");
  return (
    <a.mesh ref={onRef}>
      <boxGeometry args={[0.3, 2.5, 0.01]} />
      <meshBasicMaterial map={spearMap} transparent depthWrite={false} />
    </a.mesh>
  );
}

function Enemy({ onRef }: { onRef: Ref<MeshType | undefined> }) {
  return (
    <a.mesh ref={onRef} position={[4, 1, 0]}>
      <boxGeometry args={[4, 4, 0.01]} />
      <meshBasicMaterial color={0x00ff00} />
    </a.mesh>
  );
}

function Player({
  onRef,
  rotationZ,
}: {
  onRef: Ref<MeshType | undefined>;
  rotationZ: SpringValue<number>;
}) {
  return (
    <a.mesh ref={onRef} position={[-5, 0, -0.1]} rotation-z={rotationZ}>
      <boxGeometry args={[1, 2, 0.01]} />
      <meshBasicMaterial color={"#ff6d6d"} />
    </a.mesh>
  );
}

function LineDashed() {
  const ref = useRef();

  useEffect(() => {
    // ref.current;
  }, []);

  return (
    <mesh ref={ref}>
      {/* <bufferGeometry />
      <lineDashedMaterial
        color="blue"
        linewidth={1}
        scale={1}
        dashSize={1}
        gapSize={0.5}
      /> */}
    </mesh>
  );
}

function mapRange(
  value: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number
) {
  return Math.min(
    max2,
    min2 + ((max2 - min2) * (value - min1)) / (max1 - min1)
  );
}

function World() {
  const worldRef = useRef<MeshType>();
  const arrowRef = useRef<MeshType>();
  const enemyRef = useRef<MeshType>();
  const playerRef = useRef<MeshType>();
  const checkCollisionRef = useRef(true);
  const arrowBox = new THREE.Box3();
  const enemyBox = new THREE.Box3();
  const setEnemyRef = useRef(true);
  const arrowListRef = useRef<any>([]);
  const ARROW_ROTATION_Z = -Math.PI / 1.8;

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
      let arrowRotationZ = ARROW_ROTATION_Z;
      if (down) {
        const offsetX = movement[0];
        let playerRotation = 0;
        let arrowRotation = 0;
        if (offsetX > 0) {
          arrowRotation = -mapRange(offsetX, 0, 20, 0, 1.2);
          playerRotation = mapRange(offsetX, 0, 20, 0, 6);
        } else if (offsetX < 0) {
          arrowRotation = mapRange(-offsetX, 0, 20, 0, 3);
        }
        rotationZ = Math.PI / (7 + playerRotation);
        arrowRotationZ = -Math.PI / (3 + arrowRotation);
      } else {
        checkCollisionRef.current = true;
        arrowApi({
          arrowX: 10,
        });
      }
      set({
        rotationZ,
        arrowRotationZ,
      });
    },
  });

  useFrame(() => {
    if (arrowRef.current) {
      arrowBox.setFromObject(arrowRef.current);
    }
    if (enemyRef.current && setEnemyRef.current) {
      setEnemyRef.current = false;
      enemyBox.setFromObject(enemyRef.current);
    }
    if (checkCollisionRef.current && enemyBox.intersectsBox(arrowBox)) {
      console.log("=======collision");
      checkCollisionRef.current = false;
      if (arrowRef.current) {
        const newArrow = arrowRef.current.clone(true);
        arrowRef.current.position.set(-3, 0, 0);
        enemyRef.current?.add(arrowRef.current);
        arrowListRef.current.push(arrowRef.current);

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

  useEffect(() => {
    var geometry = new THREE.BufferGeometry();
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(2, 0, 0),
    ]);
    var points = curve.getPoints(100);
    geometry.setFromPoints(points);
    //材质对象
    var material = new THREE.LineDashedMaterial({
      color: 0xff0000,
      linewidth: 2,
      scale: 1,
      dashSize: 0.1,
      gapSize: 0.2,
    });
    //线条模型对象
    var line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    worldRef.current?.add(line);
  }, []);

  return (
    <a.mesh ref={worldRef} {...bind()}>
      <Arrow onRef={arrowRef} />
      <Enemy onRef={enemyRef} />
      <Player onRef={playerRef} rotationZ={rotationZ} />
      {/* <LineDashed /> */}
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
