import { Edges, Image as DreiImage, Text, TextProps } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { usePortalStore } from "@stores";
import { Project } from "@types";
import { useIsMobileViewport } from "@/app/hooks/useIsMobileViewport";

interface ProjectTileProps {
  project: Project;
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  activeId: number | null;
  onClick: () => void;
}

const ProjectTile = ({ project, index, position, rotation, activeId, onClick }: ProjectTileProps) => {
  const isMobile = useIsMobileViewport();
  const projectRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const titleRef = useRef<THREE.Object3D>(null);
  const dateGroupRef = useRef<THREE.Group>(null);
  const subtextRef = useRef<THREE.Object3D>(null);
  const buttonRef = useRef<THREE.Group>(null);
  const imageRef = useRef<THREE.Group>(null);
  const hoverAnimRef = useRef<gsap.core.Timeline | null>(null);
  const [hovered, setHovered] = useState(false);
  const isProjectSectionActive = usePortalStore((state) => state.activePortalId === "projects");

  const titleProps = useMemo(() => ({
    font: "./soria-font.ttf",
    color: "black",
  }), []);

  const subtitleProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: "black",
    anchorX: "left",
    anchorY: "top",
  }), []);

  useEffect(() => {
    if (!projectRef.current || !meshRef.current || !titleRef.current || !dateGroupRef.current || !subtextRef.current) return;
    hoverAnimRef.current?.kill();

    hoverAnimRef.current = gsap.timeline();
    hoverAnimRef.current
      .to(projectRef.current.position, { z: hovered ? 1 : 0, duration: 0.2 }, 0)
      .to(projectRef.current.position, { y: hovered ? 0.4 : 0 }, 0)
      .to(projectRef.current.scale, {
        x: hovered ? 1.08 : 1,
        y: hovered ? 1.08 : 1,
        z: hovered ? 1.08 : 1,
      }, 0)
      .to(subtextRef.current, { fillOpacity: hovered ? 1 : 0, duration: 0.4 }, 0)
      .to(meshRef.current.scale, { y: hovered ? 1.35 : 1 }, 0)
      .to(meshRef.current.material as THREE.Material & { opacity: number }, { opacity: hovered ? 0.95 : 0.3 }, 0)
      .to(meshRef.current.position, { y: hovered ? 0.35 : 0 }, 0);

    if (project.image && imageRef.current) {
      hoverAnimRef.current.to(imageRef.current.scale, { x: hovered ? 1 : 0, y: hovered ? 1 : 0, duration: 0.25 }, 0);
    }

    if (project.url && buttonRef.current) {
      hoverAnimRef.current
        .to(buttonRef.current.scale, { y: hovered ? 1 : 0, x: hovered ? 1 : 0 }, 0)
        .to(buttonRef.current.position, { z: hovered ? 0.3 : -1 }, 0);
    }
  }, [hovered, project.image, project.url]);

  useEffect(() => {
    if (isMobile) {
      setHovered(activeId === index);
    }
  }, [isMobile, activeId]);

  useEffect(() => {
    if (projectRef.current) {
      gsap.to(projectRef.current.position, {
        y: isProjectSectionActive ? 0 : -10,
        duration: 1,
        delay: isProjectSectionActive ? index * 0.1 : 0,
      });
    }
  }, [isProjectSectionActive]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!project.url) return;
    const button = e.eventObject;
    gsap.to(button.position, { z: 0, duration: 0.1 })
      .then(() => gsap.to(button.position, { z: 0.3, duration: 0.3 }));
    setTimeout(() => window.open(project.url, '_blank'), 50);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => !isMobile && isProjectSectionActive && setHovered(true)}
      onPointerOut={() => !isMobile && isProjectSectionActive && setHovered(false)}>
      <group ref={projectRef}>
        <mesh ref={meshRef}>
          <planeGeometry args={[4.6, 2.4, 1]} />
          <meshBasicMaterial color="#FFF" transparent opacity={0.3}/>
          {/* <meshPhysicalMaterial transmission={1} roughness={0.3} /> */}
          <Edges color="black" lineWidth={1.5} />
        </mesh>
        <Text
          {...titleProps}
          ref={titleRef}
          position={[-1.88, 0.56, 0.101]}
          anchorX="left"
          anchorY="top"
          maxWidth={project.image ? 1.95 : 3.55}
          lineHeight={0.95}
          fontSize={project.image ? 0.33 : 0.42}>
          {project.title}
        </Text>
        <group ref={dateGroupRef} position={[-1.15, 0.98, 0.01]}>
          <mesh>
            <planeGeometry args={[1.8, 0.34, 1]} />
            <meshBasicMaterial color="#777" opacity={0} wireframe />
            <Edges color="black" lineWidth={1} />
          </mesh>
          <Text
            {...subtitleProps}
            position={[-0.75, 0.12, 0]}
            fontSize={0.14}>
            {project.date.toUpperCase()}
          </Text>
          {project.prize && (
            <Text
              {...subtitleProps}
              position={[0.03, 0.12, 0]}
              fontSize={0.12}>
              {project.prize.toUpperCase()}
            </Text>
          )}
        </group>
        <Text
          {...subtitleProps}
          ref={subtextRef}
          maxWidth={project.image ? 1.95 : 3.8}
          position={[-1.88, project.image ? -0.86 : -0.54, 0.1]}
          fillOpacity={0}
          lineHeight={1.15}
          fontSize={project.image ? 0.12 : 0.15}>
          {project.subtext}
        </Text>
        {project.image && (
          <group ref={imageRef} position={[1.04, -0.08, 0.12]} scale={[0, 0, 1]}>
            <DreiImage url={project.image} scale={[1.82, 1.03, 1]} />
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[1.84, 1.05, 1]} />
              <meshBasicMaterial transparent opacity={0} />
              <Edges color="black" lineWidth={1} />
            </mesh>
          </group>
        )}
        {project.url && (
          <group
            ref={buttonRef}
            position={project.image ? [1.3, -0.98, -1] : [1.3, -0.92, -1]}
            scale={[0, 0, 1]}
            onClick={handleClick}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}>
            <mesh>
              <boxGeometry args={[1.1, 0.4, 0.2]} />
              <meshBasicMaterial color="#222" />
              <Edges color="white" lineWidth={1} />
            </mesh>
            <Text
              {...subtitleProps}
              color="white"
              position={[-0.4, 0.15, 0.2]}
              fontSize={0.25}>
              VIEW ↗
            </Text>
          </group>
        )}
      </group>
    </group>
  );
};

export default ProjectTile;