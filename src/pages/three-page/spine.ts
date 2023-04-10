import {
  AssetManager,
  AtlasAttachmentLoader,
  SkeletonJson,
  SkeletonMesh,
} from "@esotericsoftware/spine-threejs";
import * as THREE from "three";

export function createSpine(skeletonFile: string, scale: number = 0.1) {
  const atlasFile = skeletonFile
    .replace("-pro", "")
    .replace("-ess", "")
    .replace(".json", ".atlas");

  const assetManager = new AssetManager("");
  assetManager.loadText(skeletonFile);
  return new Promise<SkeletonMesh>((resole) => {
    assetManager.loadTextureAtlas(atlasFile, () => {
      const atlasFileHandle = assetManager.require(atlasFile);
      const atlasLoader = new AtlasAttachmentLoader(atlasFileHandle);
      const skeletonJson = new SkeletonJson(atlasLoader);
      skeletonJson.scale = scale;
      const skeletonFileHandle = assetManager.require(skeletonFile);
      const skeletonData = skeletonJson.readSkeletonData(skeletonFileHandle);
      const skeletonMesh = new SkeletonMesh(skeletonData, (parameters) => {
        parameters.depthTest = true;
        parameters.depthWrite = true;
        parameters.alphaTest = 0.001;
      });
      skeletonMesh.skeleton.scaleX = -1;
      resole(skeletonMesh);
    });
  });
}

export function createSpineBounds(skeletonMesh: SkeletonMesh) {
  if (!skeletonMesh) return null;
  const { x, y, width, height } = skeletonMesh.skeleton.getBoundsRect();
  const geometry = new THREE.BoxGeometry(width, height, 0);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = x;
  mesh.position.y = y;
  mesh.position.z = 0;
  skeletonMesh.add(mesh);
  return mesh;
}
