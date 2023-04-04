import { Ref, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SpringValue, a, useSpring } from "@react-spring/three";
import {
  OrbitControls,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { useGesture } from "@use-gesture/react";
import {
  SkeletonJson,
  AssetManager,
  AtlasAttachmentLoader,
  SkeletonMesh,
  TrackEntry,
} from "@esotericsoftware/spine-threejs";
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
      position={[4, 2, 0]}
      // geometry={nodes.Body.geometry}
      // material={materials["材质"]}
    >
      <boxGeometry args={[6, 6, 0.001]} />
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
      <circleGeometry args={[0.06]} />
      <meshBasicMaterial color="white" opacity={opacity} transparent />
    </mesh>
  );
}

function Path({ pathPoints }: { pathPoints: THREE.Vector3[] }) {
  let curPathPoints = pathPoints;
  const lastPoint = pathPoints[pathPoints.length - 1];
  if (!!lastPoint && lastPoint.x < 6) {
    curPathPoints = pathPoints.slice(0, 10);
  }
  return (
    <mesh>
      {curPathPoints.map((point, index) => {
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

function createSpine() {
  const skeletonFile = "spineboy.json";
  const atlasFile = skeletonFile
    .replace("-pro", "")
    .replace("-ess", "")
    .replace(".json", ".atlas");
  const animation = "idle";

  const assetManager = new AssetManager("boy/");
  assetManager.loadText(skeletonFile);
  return new Promise<SkeletonMesh>((resole) => {
    assetManager.loadTextureAtlas(atlasFile, (success) => {
      const atlas = assetManager.require(atlasFile);
      const atlasLoader = new AtlasAttachmentLoader(atlas);
      let skeletonJson = new SkeletonJson(atlasLoader);
      skeletonJson.scale = 0.005;
      const skeletonData = skeletonJson.readSkeletonData(
        assetManager.require(skeletonFile)
      );
      const skeletonMesh = new SkeletonMesh(skeletonData, (parameters) => {
        parameters.depthTest = true;
        parameters.depthWrite = true;
        parameters.alphaTest = 0.001;
      });
      skeletonMesh.skeleton.scaleX = -1;
      skeletonMesh.state.setAnimation(0, animation, true);
      resole(skeletonMesh);
    });
  });
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
  const skeletonMeshRef = useRef<SkeletonMesh>();
  const trackRef = useRef<TrackEntry>();

  const [{ rotationZ, arrowRotationZ }, set] = useSpring(() => ({
    rotationZ: 0,
    arrowRotationZ: ARROW_ROTATION_Z,
  }));

  const [{ arrowX, arrowY }, arrowApi] = useSpring(() => ({
    arrowX: -5,
    arrowY: 1.5,
    config: {
      duration: 1500,
    },
  }));

  const bind = useGesture({
    onClick: () => {
      // skeletonMeshRef.current?.state.setAnimation(0, "shoot", false);
    },
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
        refreshPathPoints(offsetX);
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
            duration: 70,
            mass: 10,
            tension: 200,
          },
          onRest: () => {
            set.stop();
            arrowApi({ arrowX: -5, arrowY: 1.5, config: { duration: 10 } });
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

  useFrame((_, delta) => {
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
      // trackRef.current = skeletonMeshRef.current?.state.setAnimation(
      //   0,
      //   "hit",
      //   false
      // );
      if (arrowRef.current) {
        const newArrow = arrowRef.current.clone(true);
        const enemyX = enemyRef.current?.position.x || 4;
        const enemyY = enemyRef.current?.position.y || 1;
        arrowRef.current.position.set(
          arrowRef.current.position.x - enemyX,
          arrowRef.current.position.y - enemyY,
          0
        );
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
        arrowApi({ arrowX: -5, arrowY: 1.5, config: { duration: 10 } });
        worldRef.current?.add(arrowRef.current);
      }
    } else {
      arrowRef.current?.rotation.set(0, 0, arrowRotationZ.get());
      arrowRef.current?.position.set(arrowX.get(), arrowY.get(), 0);
    }
    skeletonMeshRef.current?.update(delta);
  });

  const refreshPathPoints = (distance: number) => {
    const z = 0.1;
    const startX = -4;
    let endX = 6;
    const startY = 2;
    let endY = startY;
    let middleY = startY;
    const offsetX = 60;
    const maxOffsetX = 120;
    if (distance >= 0) {
      endY = startY - mapRangeMin(distance, 0, offsetX, 0, 6);
      middleY = startY - mapRangeMin(distance, 0, offsetX, 0, 1);
    } else if (distance < -offsetX) {
      middleY = startY + 2 + mapRangeMin(-distance, offsetX, maxOffsetX, 4, 6);
      endX = endX - mapRangeMin(-distance, offsetX, maxOffsetX, 0, 4);
    } else {
      endY = startY + mapRangeMin(-distance, 0, offsetX, 0, 6);
      middleY = startY + mapRangeMin(-distance, 0, offsetX, 0, 6);
      endX = endX + mapRangeMin(-distance, 0, offsetX, 0, 2);
    }
    const middleX = (startX + endX) / 2;
    // console.log(distance, endY, middleY, endX);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startX, startY, z),
      new THREE.Vector3(middleX, middleY, z),
      new THREE.Vector3(endX, endY, z),
    ]);
    const points = curve.getPoints(18);
    setPathPoints(points);
  };

  useEffect(() => {
    // initSpine();
  }, []);

  async function initSpine() {
    const skeletonMesh = await createSpine();
    skeletonMeshRef.current = skeletonMesh;
    // const geometry = new THREE.BoxGeometry(5, 5, 0);
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    // });
    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.add(skeletonMesh);
    // @ts-ignore
    skeletonMesh.state.addListener({
      complete: (e: TrackEntry) => {
        console.log("complete=", e.animation?.name);
        const { name } = e.animation || {};
        if (name === "hit") {
          trackRef.current = skeletonMeshRef.current?.state.setAnimation(
            0,
            "idle",
            true
          );
        }
      },
    });
    worldRef.current?.add(skeletonMesh as unknown as THREE.Object3D<Event>);
  }

  return (
    // @ts-ignore
    <a.mesh ref={worldRef} {...bind()}>
      {/* <OrbitControls></OrbitControls> */}
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
