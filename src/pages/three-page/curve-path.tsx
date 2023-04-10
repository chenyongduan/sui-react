import { mapRange } from "./utils";

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

export function CurvePath({ pathPoints }: { pathPoints: THREE.Vector3[] }) {
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
