import { Text, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { usePortalStore } from "@stores";
import { useRef } from "react";
import * as THREE from 'three';
import { useIsMobileViewport } from "@/app/hooks/useIsMobileViewport";
import GridTile from "./GridTile";
import Projects from "./projects";
import Work from "./work";

const Experience = () => {
  const isMobile = useIsMobileViewport();
  const titleRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const data = useScroll();
  const isActive = usePortalStore((state) => !!state.activePortalId);

  const fontProps = {
    font: "./soria-font.ttf",
    fontSize: 0.4,
    color: 'white',
  };

  useFrame((sate, delta) => {
    const d = data.range(0.8, 0.2);
    const e = data.range(0.7, 0.2);

    if (groupRef.current && !isActive) {
      groupRef.current.position.y = d > 0 ? -1 : -30;
      groupRef.current.visible = d > 0;
    }

    if (titleRef.current) {
      titleRef.current.children.forEach((text, i) => {
        const y =  Math.max(Math.min((1 - d) * (10 - i), 10), 0.5);
        text.position.y = THREE.MathUtils.damp(text.position.y, y, 7, delta);
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        (text as any).fillOpacity = e;
      });
    }
  });

  const getTitle = () => {
    if (isMobile) {
      return (
        <Text {...fontProps} fontSize={0.42} position={[0, 2.15, 1]} anchorX="center" anchorY="middle" maxWidth={3.4}>
          EXPERIENCE
        </Text>
      );
    }

    const title = 'experience'.toUpperCase();
    return title.split('').map((char, i) => {
      const diff = 0.8;
      return (
        <Text key={i} {...fontProps} position={[i * diff, 2, 1]}>{char}</Text>
      );
    });
  };

  return (
    <group position={[0, -41.5, 12]} rotation={[-Math.PI / 2, 0 ,-Math.PI / 2]}>
      {/* <mesh receiveShadow position={[-5, 0, 0.1]}>
        <planeGeometry args={[10, 5, 1]} />
        <shadowMaterial opacity={0.1} />
      </mesh> */}
      <group rotation={[0, 0, Math.PI / 2]}>
        <group ref={titleRef} position={[isMobile ? 0 : -3.6, 2, -2]}>
          {getTitle()}
        </group>

        <group position={[0, isMobile ? -0.15 : -1, 0]} ref={groupRef}>
          <GridTile title='WORK & EDUCATION'
            id="work"
            color='#b9c6d6'
            textAlign={isMobile ? 'center' : 'left'}
            mobileCoverImage="/images/experience/work-hero.jpg"
            position={new THREE.Vector3(isMobile ? 0 : -2, isMobile ? 1.08 : 0, isMobile ? 0.2 : 0)}>
            <Work/>
          </GridTile>
          <GridTile title='SIDE PROJECTS'
            id="projects"
            color='#bdd1e3'
            textAlign={isMobile ? 'center' : 'right'}
            mobileCoverImage="/images/experience/projects-hero.jpg"
            position={new THREE.Vector3(isMobile ? 0 : 2, isMobile ? -1.12 : 0, 0)}>
            <Projects/>
          </GridTile>
        </group>
      </group>
    </group>
  );
};

export default Experience;