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

/** Pull labels away from the right edge of the phone viewport in portal space. */
const MOBILE_LABEL_OFFSET = new THREE.Vector3(-0.92, -0.04, 0.14);
const MOBILE_BACKPLATE_W = 2.62;
const MOBILE_BACKPLATE_H = 1.12;

const mobileOutline = {
  outlineWidth: '8%',
  outlineColor: '#050505',
  outlineOpacity: 1,
} as const;

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

  const pointScale = isMobile ? 0.34 : 0.5;

  return (
    <group position={point.point} scale={pointScale}>
      {!isMobile && (
        <Box args={[0.2, 0.2, 0.2]} position={[0, 0, -0.1]} scale={[1 - diff, 1 - diff, 1 - diff]}>
          <meshBasicMaterial color="white" wireframe />
          <Edges color="white" lineWidth={1.5} />
        </Box>
      )}
      <group>
        {isMobile ? (
          <group position={MOBILE_LABEL_OFFSET}>
            <mesh position={[0, 0, -0.035]} renderOrder={-1}>
              <planeGeometry args={[MOBILE_BACKPLATE_W, MOBILE_BACKPLATE_H, 1]} />
              <meshBasicMaterial
                color="#050505"
                transparent
                opacity={0.78}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <Text
              {...textProps}
              {...mobileOutline}
              color="#f6f6f6"
              fontSize={0.16}
              position={[0, 0.36, 0.02]}
              anchorX="center"
              anchorY="middle"
              maxWidth={2.35}
              overflowWrap="break-word"
            >
              {point.year}
            </Text>
            <Text
              {...titleProps}
              {...mobileOutline}
              color="#ffffff"
              fontSize={0.2}
              position={[0, 0.04, 0.02]}
              anchorX="center"
              anchorY="middle"
              maxWidth={2.35}
              lineHeight={1.08}
              overflowWrap="break-word"
            >
              {point.title}
            </Text>
            <Text
              {...textProps}
              {...mobileOutline}
              color="#e8e8e8"
              fontSize={0.125}
              maxWidth={2.35}
              lineHeight={1.12}
              position={[0, -0.42, 0.02]}
              anchorX="center"
              anchorY="middle"
              overflowWrap="break-word"
            >
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
      const mobileCamBiasX = 0.42;
      const mobileCamBiasZ = 0.35;
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        (isMobile ? -0.85 : -2) + position.x + (isMobile ? mobileCamBiasX : 0),
        4,
        delta
      );
      camera.position.y = THREE.MathUtils.damp(camera.position.y, -39 + position.z, 4, delta);
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        13 - position.y + (isMobile ? mobileCamBiasZ : 0),
        4,
        delta
      );
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
      <Line points={visibleCurvePoints} color={isMobile ? '#ffffff' : 'white'} lineWidth={isMobile ? 1.2 : 3} opacity={isMobile ? 0.35 : 1} transparent={isMobile} />
      {visibleDashedCurvePoints.length > 0 && !isMobile && (
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
