import { useEffect, useRef } from "react";
import {
  MeshAttachment,
  RegionAttachment,
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
  const boundsMeshRef = useRef<MeshType>();
  const trackRef = useRef<TrackEntry>();
  const boneBoundsListRef = useRef({});

  useEffect(() => {
    if (!skeletonMeshRef.current) {
      initSpine();
    }
  }, []);

  async function initSpine() {
    const skeletonMesh = await createSpine("man/stretchyman.json", 0.005);
    skeletonMesh.skeleton.scaleX = -1;
    skeletonMesh.position.x = 3;
    skeletonMesh.position.y = -1;
    skeletonMesh.state.setAnimation(0, "sneak", true);

    const bone = skeletonMesh.skeleton.findBone("head");
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = bone?.worldX || 0;
    mesh.position.y = bone?.worldY || 0;
    mesh.position.z = 0.5;
    //@ts-ignore
    skeletonMesh.add(mesh);

    boneMeshRef.current = mesh;

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
  }

  const createBounds = (skeletonMesh: SkeletonMesh) => {
    setTimeout(() => {
      const spineBoundsMesh = createSpineBounds(skeletonMesh);
      boundsMeshRef.current = spineBoundsMesh;

      skeletonMesh.skeleton.slots.map((slot) => {
        const { bone, attachment } = slot;
        console.log(slot);
        if (attachment) {
          const { worldX, worldY } = bone;
          if (attachment instanceof RegionAttachment) {
            const { width, height, name } = attachment;
            console.log(width, height, attachment);
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0);
            const material = new THREE.MeshBasicMaterial({
              color: 0x00ff00,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = worldX;
            mesh.position.y = worldY;
            mesh.position.z = 0;
            skeletonMesh.add(mesh);
            boneBoundsListRef.current[name] = mesh;
          }
        }
      });
    }, 500);
  };

  useFrame((_, delta) => {
    skeletonMeshRef.current?.update(delta);
    if (skeletonMeshRef.current) {
      const bone = skeletonMeshRef.current.skeleton.findBone("head");
      boneMeshRef.current?.position.setX(bone?.worldX || 0);
      boneMeshRef.current?.position.setY(bone?.worldY || 0);

      // console.log(skeletonMeshRef.current.skeleton.slots[3]);

      if (boundsMeshRef.current) {
        const { x, y } = skeletonMeshRef.current.skeleton.getBoundsRect();
        boundsMeshRef.current?.position.set(x, y, 0);
      }

      skeletonMeshRef.current.skeleton.slots.map((slot) => {
        const { bone, attachment } = slot;
        if (attachment) {
          const { worldX, worldY } = bone;
          if (attachment instanceof MeshAttachment) {
            const { name } = attachment;
            const mesh = boneBoundsListRef.current[name];
            if (mesh) {
              // console.log(name, worldX, worldY);
              mesh.position.set(worldX, worldY, 0);
            }
          }
        }
      });
    }
  });

  return null;
}
