import { useEffect, useRef } from "react";
import {
  BoundingBoxAttachment,
  SkeletonMesh,
  TrackEntry,
} from "@esotericsoftware/spine-threejs";
import { createSpine, createSpineBounds } from "./spine";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshType } from "./style";

type Props = {
  onLoadEnd: (skeletonMesh: SkeletonMesh) => void;
};

export function Enemy({ onLoadEnd }: Props) {
  const skeletonMeshRef = useRef<SkeletonMesh>();
  const boneMeshRef = useRef<MeshType>();
  const boundsMeshRef = useRef<THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshBasicMaterial
  > | null>(null);
  const trackRef = useRef<TrackEntry>();
  const boundingBoxListRef = useRef([]);
  const boneBoundsListRef = useRef<MeshType[]>([]);
  const lineSegmentsRef =
    useRef<THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>>();

  useEffect(() => {
    if (!skeletonMeshRef.current) {
      initSpine();
    }
  }, []);

  async function initSpine() {
    const skeletonMesh = await createSpine("man/Stoneman.json", 0.002);
    skeletonMesh.skeleton.scaleX = -1;
    skeletonMesh.position.x = 5;
    skeletonMesh.position.y = -1;
    skeletonMesh.skeleton.setSkinByName("Stoneman_a");
    skeletonMesh.state.setAnimation(0, "attack1", true);

    // const bone = skeletonMesh.skeleton.findBone("head");
    // const geometry = new THREE.BoxGeometry(0.2, 0.2, 0);
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    // });
    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.position.x = bone?.worldX || 0;
    // mesh.position.y = bone?.worldY || 0;
    // mesh.position.z = 0.5;
    // //@ts-ignore
    // skeletonMesh.add(mesh);

    // boneMeshRef.current = mesh;

    // @ts-ignore
    skeletonMesh.state.addListener({
      complete: (e: TrackEntry) => {
        console.log("complete=", e.animation?.name);
        const { name } = e.animation || {};
        if (name === "hit") {
          trackRef.current = skeletonMesh.state.setAnimation(0, "idle", true);
        }
      },
      event: (entry, event) => {
        // console.log(entry, event);
      },
    });

    skeletonMeshRef.current = skeletonMesh;
    onLoadEnd(skeletonMesh);
    createBounds(skeletonMesh);
    createBoundingBox(skeletonMesh);
  }

  const createBoundingBox = (skeletonMesh: SkeletonMesh) => {
    setTimeout(() => {
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const lineSegments = new THREE.LineSegments(geometry, material);
      lineSegmentsRef.current = lineSegments;
      skeletonMesh.add(lineSegments);
    }, 500);
  };

  const createBounds = (skeletonMesh: SkeletonMesh) => {
    setTimeout(() => {
      // const spineBoundsMesh = createSpineBounds(skeletonMesh);
      // boundsMeshRef.current = spineBoundsMesh;

      skeletonMesh.skeleton.bones.map((bone) => {
        const { worldX, worldY } = bone;
        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0);
        const material = new THREE.MeshBasicMaterial({
          color: "yellow",
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = worldX;
        mesh.position.y = worldY;
        mesh.position.z = 1;
        skeletonMesh.add(mesh);
        boneBoundsListRef.current.push(mesh);
      });
    }, 500);
  };

  useFrame((_, delta) => {
    skeletonMeshRef.current?.update(delta);
    if (skeletonMeshRef.current) {
      // const bone = skeletonMeshRef.current.skeleton.findBone("head");
      // boneMeshRef.current?.position.setX(bone?.worldX || 0);
      // boneMeshRef.current?.position.setY(bone?.worldY || 0);

      if (boundsMeshRef.current) {
        const { x, y, width, height } =
          skeletonMeshRef.current.skeleton.getBoundsRect();
        boundsMeshRef.current?.position.set(x + width / 2, y + height / 2, 0);
      }

      skeletonMeshRef.current.skeleton.bones.map((bone, index) => {
        const { worldX, worldY } = bone;
        const mesh = boneBoundsListRef.current[index];
        if (mesh) {
          mesh.position.set(worldX, worldY, 0.5);
        }
      });

      if (lineSegmentsRef.current) {
        const slot = skeletonMeshRef.current.skeleton.findSlot("head");
        const attachment = skeletonMeshRef.current.skeleton.getAttachmentByName(
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
          points.push(new THREE.Vector3(arr[i], arr[i + 1], 1));
        }

        lineSegmentsRef.current.geometry.setFromPoints(points);
      }
    }
  });

  return null;
}
