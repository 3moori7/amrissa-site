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

/** First role: centered card over dark foreground (reference layout). */
const MOBILE_CENTER_OFFSET = new THREE.Vector3(0, -0.22, 0.14);
/** Later roles: left stack like Research Lead / Software Solutions references. */
const MOBILE_LEFT_OFFSET = new THREE.Vector3(-1.02, -0.16, 0.14);

const MOBILE_BACKPLATE_CENTER_W = 2.45;
const MOBILE_BACKPLATE_CENTER_H = 1.18;
const MOBILE_BACKPLATE_LEFT_W = 2.55;
const MOBILE_BACKPLATE_LEFT_H = 1.22;

const mobileOutlineSoft = {
  outlineWidth: '5%',
  outlineColor: '#0a0a0a',
  outlineOpacity: 0.85,
} as const;

type MobileLayoutMode = 'center' | 'left';

const TimelinePoint = ({
  point,
  diff,
  isMobile,
  mobileLayout,
}: {
  point: WorkTimelinePoint;
  diff: number;
  isMobile: boolean;
  mobileLayout: MobileLayoutMode;
}) => {
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
    anchorX: isMobile ? (mobileLayout === 'center' ? 'center' : 'left') : textAlign,
    fillOpacity,
  }), [textAlign, diff, isMobile, mobileLayout]);

  const titleProps = useMemo(() => ({
    ...textProps,
    font: "./soria-font.ttf",
    fontSize: isMobile ? (mobileLayout === 'center' ? 0.3 : 0.27) : 0.42,
    maxWidth: isMobile ? (mobileLayout === 'center' ? 2.15 : 2.35) : 2.4,
    lineHeight: isMobile ? (mobileLayout === 'center' ? 1 : 0.95) : 1,
    anchorX: (isMobile ? (mobileLayout === 'center' ? 'center' : 'left') : textAlign) as TextProps['anchorX'],
  }), [textProps, isMobile, textAlign, mobileLayout]);

  const pointScale = isMobile ? 0.38 : 0.5;

  return (
    <group position={point.point} scale={pointScale}>
      {!isMobile && (
        <Box args={[0.2, 0.2, 0.2]} position={[0, 0, -0.1]} scale={[1 - diff, 1 - diff, 1 - diff]}>
          <meshBasicMaterial color="white" wireframe />
          <Edges color="white" lineWidth={1.5} />
        </Box>
      )}
      <group>
        {isMobile && mobileLayout === 'center' ? (
          <group position={MOBILE_CENTER_OFFSET}>
            <mesh position={[0, 0, -0.035]} renderOrder={-1}>
              <planeGeometry args={[MOBILE_BACKPLATE_CENTER_W, MOBILE_BACKPLATE_CENTER_H, 1]} />
              <meshBasicMaterial
                color="#070504"
                transparent
                opacity={0.64}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <Text
              {...textProps}
              {...mobileOutlineSoft}
              color="#f4f4f4"
              fontSize={0.15}
              position={[0, 0.4, 0.02]}
              anchorX="center"
              anchorY="middle"
              maxWidth={2.1}
              letterSpacing={0.02}
              overflowWrap="break-word"
            >
              {point.year}
            </Text>
            <Text
              {...titleProps}
              {...mobileOutlineSoft}
              color="#ffffff"
              position={[0, 0.02, 0.02]}
              anchorX="center"
              anchorY="middle"
              overflowWrap="break-word"
            >
              {point.title}
            </Text>
            <Text
              {...textProps}
              {...mobileOutlineSoft}
              color="#ececec"
              fontSize={0.128}
              maxWidth={2.1}
              lineHeight={1.1}
              position={[0, -0.44, 0.02]}
              anchorX="center"
              anchorY="middle"
              overflowWrap="break-word"
            >
              {point.subtitle}
            </Text>
          </group>
        ) : isMobile ? (
          <group position={MOBILE_LEFT_OFFSET}>
            <mesh position={[MOBILE_BACKPLATE_LEFT_W / 2 - 0.06, -0.02, -0.035]} renderOrder={-1}>
              <planeGeometry args={[MOBILE_BACKPLATE_LEFT_W, MOBILE_BACKPLATE_LEFT_H, 1]} />
              <meshBasicMaterial
                color="#060403"
                transparent
                opacity={0.62}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <group position={[0.02, 0.34, 0.03]}>
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[0.11, 0.11, 1]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} />
              </mesh>
              <Line
                points={[new THREE.Vector3(0, -0.06, 0.001), new THREE.Vector3(0, -0.38, 0.001)]}
                color="#ffffff"
                lineWidth={1}
                opacity={0.55}
                transparent
              />
            </group>
            <Text
              {...textProps}
              {...mobileOutlineSoft}
              color="#f2f2f2"
              fontSize={0.142}
              position={[0.22, 0.38, 0.02]}
              anchorX="left"
              anchorY="middle"
              maxWidth={2.2}
              letterSpacing={0.025}
              overflowWrap="break-word"
            >
              {point.year}
            </Text>
            <Text
              {...titleProps}
              {...mobileOutlineSoft}
              color="#ffffff"
              position={[0.22, 0.05, 0.02]}
              anchorX="left"
              anchorY="middle"
              overflowWrap="break-word"
            >
              {point.title}
            </Text>
            <Text
              {...textProps}
              {...mobileOutlineSoft}
              color="#e6e6e6"
              fontSize={0.124}
              maxWidth={2.2}
              lineHeight={1.12}
              position={[0.22, -0.46, 0.02]}
              anchorX="left"
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
      const mobileCamBiasX = progress < 0.12 ? 0.18 : 0.48;
      const mobileCamBiasZ = progress < 0.12 ? 0.28 : 0.38;
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        (isMobile ? -0.82 : -2) + position.x + (isMobile ? mobileCamBiasX : 0),
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
          const mobileLayout: MobileLayoutMode = i === 0 ? 'center' : 'left';
          return (
            <TimelinePoint point={point} key={i} diff={diff} isMobile={isMobile} mobileLayout={mobileLayout} />
          );
        })}
      </group>
    </group>
  );
};

export default Timeline;
