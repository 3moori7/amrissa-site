import { Box, Edges, Line, Text, TextProps } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { usePortalStore } from "@stores";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { WORK_TIMELINE } from "@constants";
import { WorkTimelinePoint } from "@types";
import { useIsMobileViewport } from "@/app/hooks/useIsMobileViewport";

const reusableLeft = new THREE.Vector3(-0.3, 0, -0.1);
const reusableRight = new THREE.Vector3(0.3, 0, -0.1);

const TimelinePoint = ({ point, diff, isMobile }: { point: WorkTimelinePoint, diff: number, isMobile: boolean }) => {
  const getPoint = useMemo(() => {
    switch (point.position) {
      case 'left': return reusableLeft;
      case 'right': return reusableRight;
      default: return new THREE.Vector3();
    }
  }, [point.position]);

  const textAlign = point.position === 'left' ? 'right' : 'left';

  const fillOpacity = Math.min(1, Math.max(0, 1 - diff));

  const textProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: "white",
    anchorX: isMobile ? 'center' : textAlign,
    fillOpacity,
  }), [textAlign, diff, isMobile]);

  const titleProps = useMemo(() => ({
    ...textProps,
    font: "./soria-font.ttf",
    fontSize: isMobile ? 0.22 : 0.42,
    maxWidth: isMobile ? 2.75 : 2.4,
    lineHeight: isMobile ? 1.05 : 1,
    anchorX: (isMobile ? 'center' : textAlign) as TextProps['anchorX'],
  }), [textProps, isMobile, textAlign]);

  const pointScale = isMobile ? 0.36 : 0.5;

  return (
    <group position={point.point} scale={pointScale}>
      <Box args={[0.2, 0.2, 0.2]} position={[0, 0, -0.1]} scale={[1 - diff, 1 - diff, 1 - diff]}>
        <meshBasicMaterial color="white" wireframe />
        <Edges color="white" lineWidth={1.5} />
      </Box>
      <group>
        {isMobile ? (
          <group position={[0, 0, 0]}>
            <Text {...textProps} fontSize={0.17} position={[0, 0.42, 0]} anchorX="center" anchorY="middle">
              {point.year}
            </Text>
            <Text {...titleProps} position={[0, 0.06, 0]} anchorX="center" anchorY="middle">
              {point.title}
            </Text>
            <Text
              {...textProps}
              fontSize={0.13}
              maxWidth={2.75}
              lineHeight={1.1}
              position={[0, -0.52, 0]}
              anchorX="center"
              anchorY="middle">
              {point.subtitle}
            </Text>
          </group>
        ) : (
          <group position={getPoint}>
            <Text {...textProps} fontSize={0.24} position={[-diff / 2, 0.2, 0]}>
              {point.year}
            </Text>
            <group position={[0, -0.32, 0]}>
              <Text {...titleProps} position={[0, -diff / 2, 0]}>
                {point.title}
              </Text>
              <Text
                {...textProps}
                fontSize={0.16}
                maxWidth={2.4}
                lineHeight={1}
                position={[0, -0.86 - diff, 0]}>
                {point.subtitle}
              </Text>
            </group>
          </group>
        )}
      </group>
    </group>
  );
};

const Timeline = ({ progress }: { progress: number }) => {
  const isMobile = useIsMobileViewport();
  const { camera } = useThree();
  const isActive = usePortalStore((state) => state.activePortalId === 'work');
  const timeline = useMemo(() => WORK_TIMELINE, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(timeline.map(p => p.point), false), [timeline]);
  const curvePoints = useMemo(() => curve.getPoints(500), [curve]);
  const visibleCurvePoints = useMemo(() => curvePoints.slice(0, Math.max(1, Math.ceil(progress * curvePoints.length))), [curvePoints, progress]);
  const visibleTimelinePoints = useMemo(() => timeline.slice(0, Math.max(1, Math.round(progress * (timeline.length - 1) + 1))), [timeline, progress]);

  const [visibleDashedCurvePoints, setVisibleDashedCurvePoints] = useState<THREE.Vector3[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useFrame((_, delta) => {
    if (isActive) {
      const position = curve.getPoint(progress);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, (isMobile ? -1 : -2) + position.x, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, -39 + position.z, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 13 - position.y, 4, delta);
    }
  });

  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    if (groupRef.current) {
      tl.to(groupRef.current.scale, {
        x: isActive ? 1 : 0,
        y: isActive ? 1 : 0,
        z: isActive ? 1 : 0,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      });
      tl.to(groupRef.current.position, {
        y: isActive ? 0 : -2,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      }, 0);
    }

    if (isActive) {
      let i = 0;
      clearInterval(intervalRef.current!);
      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const p = i++ / 100;
          setVisibleDashedCurvePoints(curvePoints.slice(0, Math.max(1, Math.ceil(p * curvePoints.length))));
          if (i > 100 && intervalRef.current) clearInterval(intervalRef.current);
        }, 10);
      }, 1000);
    } else {
      setVisibleDashedCurvePoints([]);
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isActive]);

  return (
    <group position={[0, -0.1, -0.1]}>
      <Line points={visibleCurvePoints} color="white" lineWidth={3} />
      {visibleDashedCurvePoints.length > 0 && (
        <Line
          points={visibleDashedCurvePoints}
          color="white"
          lineWidth={0.5}
          dashed
          dashSize={0.25}
          gapSize={0.25}
        />
      )}
      <group ref={groupRef}>
        {visibleTimelinePoints.map((point, i) => {
          const diff = Math.min(2 * Math.max(i - (progress * (timeline.length - 1)), 0), 1);
          return <TimelinePoint point={point} key={i} diff={diff} isMobile={isMobile} />;
        })}
      </group>
    </group>
  );
};

export default Timeline;
