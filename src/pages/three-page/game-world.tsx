import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";
import { useGesture } from "@use-gesture/react";
import { SkeletonMesh, TrackEntry } from "@esotericsoftware/spine-threejs";
import { mapRangeMin } from "./utils";
import { createSpine } from "./spine";
import { CurvePath } from "./curve-path";
import { MeshType } from "./style";
import { Enemy } from "./enemy";
import { Player } from "./player";
import { Weapon } from "./weapon";

export function GameWorld() {
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
  const boneMeshRef = useRef<MeshType>();
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
      if (arrowRef.current) {
        const newArrow = arrowRef.current.clone(true);
        // const enemyX = enemyRef.current?.position.x || 4;
        // const enemyY = enemyRef.current?.position.y || 1;
        // arrowRef.current.position.set(
        //   arrowRef.current.position.x - enemyX,
        //   arrowRef.current.position.y - enemyY,
        //   0
        // );
        // enemyRef.current?.add(arrowRef.current);
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

    if (skeletonMeshRef.current) {
      const bone = skeletonMeshRef.current.skeleton.findBone("gun");
      boneMeshRef.current?.position.setX(bone?.worldX || 0);
      boneMeshRef.current?.position.setY(bone?.worldY || 0);

      arrowListRef.current.map((arrowMesh: any) => {
        arrowMesh.position.setZ(1);
        arrowMesh.position.setX(bone?.worldX || 0);
        arrowMesh.position.setY(bone?.worldY || 0);
      });
    }
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
    if (!skeletonMeshRef.current) {
      initSpine();
    }
  }, []);

  async function initSpine() {
    const skeletonMesh = await createSpine("man/stretchyman.json", 0.005);
    skeletonMesh.skeleton.scaleX = -1;
    // skeletonMesh.state.setAnimation(0, "sneak", true);
    skeletonMeshRef.current = skeletonMesh;

    const bone = skeletonMesh.skeleton.findBone("gun");
    const slot = skeletonMesh.skeleton.findSlot("gun");

    console.log(skeletonMesh.skeleton.slots);
    console.log(bone);

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = bone?.worldX || 0;
    mesh.position.y = bone?.worldY || 0;
    mesh.position.z = 0.5;
    boneMeshRef.current = mesh;
    //@ts-ignore
    skeletonMesh.add(mesh);

    setTimeout(() => {
      console.log(skeletonMesh.skeleton?.getRootBone()?.worldY);
      const { x, y, width, height } = skeletonMesh.skeleton?.getBoundsRect();
      const geometry1 = new THREE.BoxGeometry(width, height, 0);
      const material1 = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      });
      const mesh1 = new THREE.Mesh(geometry1, material1);
      mesh1.position.x = x;
      mesh1.position.y = y;
      mesh1.position.z = 0;
      worldRef.current?.add(mesh1);
    }, 100);

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
      event: (entry, event) => {
        // console.log(entry, event);
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
      <CurvePath pathPoints={pathPoints} />
      <Weapon onRef={arrowRef} />
    </a.mesh>
  );
}
