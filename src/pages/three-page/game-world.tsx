import { useCallback, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoundingBoxAttachment,
  SkeletonMesh,
} from "@esotericsoftware/spine-threejs";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";
import { useGesture } from "@use-gesture/react";
import { mapRangeMin } from "./utils";
import { CurvePath } from "./curve-path";
import { MeshType } from "./style";
import { Enemy } from "./enemy";
import { Player } from "./player";
import { Weapon } from "./weapon";
import { OrbitControls } from "@react-three/drei";

export function GameWorld() {
  const worldRef = useRef<MeshType>();
  const weaponRef = useRef<MeshType>();
  const enemyRef = useRef<SkeletonMesh>();
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

  useFrame(() => {
    if (weaponRef.current) {
      arrowBox.setFromObject(weaponRef.current);
    }
    // if (enemyRef.current && !setEnemyRef.current) {
    // enemyBoxRef.current.setFromObject(enemyRef.current);
    // }

    if (
      checkCollisionRef.current &&
      enemyBoxRef.current.intersectsBox(arrowBox)
    ) {
      console.log("=checkCollision=");
      checkCollisionRef.current = false;
      if (weaponRef.current) {
        const newWeapon = weaponRef.current.clone(true);
        const enemyX = enemyRef.current?.position.x || 5;
        const enemyY = enemyRef.current?.position.y || -1;
        enemyRef.current?.add(weaponRef.current);

        const head = enemyRef.current?.skeleton.findBone("head");
        arrowListRef.current.push({
          weapon: weaponRef.current,
          x: weaponRef.current.position.x - enemyX - (head?.worldX || 0),
          y: weaponRef.current.position.y - enemyY - (head?.worldY || 0),
        });

        newWeapon?.rotation.set(0, 0, 0);
        set.stop();
        arrowApi.stop();
        if (arrowListRef.current.length > 3) {
          const cube = arrowListRef.current.shift();
          cube.weapon.removeFromParent();
        }

        newWeapon.name = "newWeapon";
        weaponRef.current = newWeapon;
        arrowApi({ arrowX: -5, arrowY: 1.5, config: { duration: 10 } });
        worldRef.current?.add(weaponRef.current);
      }
    } else {
      weaponRef.current?.rotation.set(0, 0, arrowRotationZ.get());
      weaponRef.current?.position.set(arrowX.get(), arrowY.get(), 0);
    }

    if (enemyRef.current) {
      const head = enemyRef.current.skeleton.findBone("head");
      arrowListRef.current.map((data: any) => {
        const { weapon, x, y } = data;
        weapon.position.set(x + head?.worldX, y + head?.worldY, 1.2);
      });

      const slot = enemyRef.current.skeleton.findSlot("head");
      const attachment = enemyRef.current.skeleton.getAttachmentByName(
        "head",
        "head"
      ) as BoundingBoxAttachment;
      let arr: number[] = [];
      attachment.computeWorldVertices(
        slot!,
        0,
        attachment.worldVerticesLength,
        arr,
        0,
        2
      );
      const points = [];
      for (let i = 0; i < arr.length; i += 2) {
        points.push(
          new THREE.Vector3(
            arr[i] + enemyRef.current?.position.x,
            arr[i + 1] + enemyRef.current?.position.y,
            0
          )
        );
      }
      enemyBoxRef.current.setFromPoints(points);
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

  const onEnemyLoadEnd = useCallback((skeletonMesh: SkeletonMesh) => {
    if (!skeletonMesh) return;
    enemyRef.current = skeletonMesh;
    // @ts-ignore
    worldRef.current?.add(skeletonMesh);
  }, []);

  return (
    // @ts-ignore
    <a.mesh ref={worldRef} {...bind()}>
      {/* <OrbitControls></OrbitControls> */}
      <Enemy onLoadEnd={onEnemyLoadEnd} />
      <Player onRef={playerRef} rotationZ={rotationZ} />
      <CurvePath pathPoints={pathPoints} />
      <Weapon onRef={weaponRef} />
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.1, 0.1, 0]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </a.mesh>
  );
}
