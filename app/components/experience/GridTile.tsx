
import { Edges, MeshPortalMaterial, Text, TextProps } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { usePortalStore } from '@stores';
import gsap from "gsap";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useIsMobileViewport } from '@/app/hooks/useIsMobileViewport';
import MobileTileCover from './MobileTileCover';

const MOBILE_TILE_W = 3.35;
const MOBILE_TILE_H = 2.05;

interface GridTileProps {
  id: string;
  title: string;
  textAlign: TextProps['textAlign'];
  children: React.ReactNode;
  color: string;
  position: THREE.Vector3;
  /** Full-bleed image on the tile face (mobile only). */
  mobileCoverImage?: string;
}

// TODO: Rename this
const GridTile = (props: GridTileProps) => {
  const isMobile = useIsMobileViewport();
  const titleRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Group>(null);
  const hoverBoxRef = useRef<THREE.Mesh>(null);
  const portalRef = useRef(null);
  const { title, textAlign, children, color, position, id, mobileCoverImage } = props;
  const { camera } = useThree();
  const setActivePortal = usePortalStore((state) => state.setActivePortal);
  const isActive = usePortalStore((state) => state.activePortalId === id);
  const activePortalId = usePortalStore((state) => state.activePortalId);
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      exitPortal(true);
    }
  };

  const portalInto = (e: React.MouseEvent) => {
    if (isActive || activePortalId) return;
    e.stopPropagation();
    setActivePortal(id);
    document.body.style.cursor = 'auto';
    const div = document.createElement('div');

    div.className = 'fixed close';
    div.style.transform = 'rotateX(90deg)';
    div.onclick = () => exitPortal(true);

    if (!document.querySelector('.close')) {
      document.body.appendChild(div);

      gsap.fromTo(div, {
        scale: 0,
        rotate: '-180deg',
      },{
        opacity: 1,
        zIndex: 10,
        transform: 'rotateX(0deg)',
        scale: 1,
        duration: 1,
      })
    }
    document.body.addEventListener('keydown', handleEscape);
    gsap.to(portalRef.current, {
      blend: 1,
      duration: 0.5,
    });
  };

  const exitPortal = (force = false) => {
    if (!force && !activePortalId) return;
    setActivePortal(null)

    gsap.to(camera.position, {
      x: 0,
      duration: 1,
    });

    gsap.to(camera.rotation, {
      x: -Math.PI / 2,
      y: 0,
      duration: 1,
    });

    gsap.to(portalRef.current, {
      blend: 0,
      duration: 1,
    });

    // Remove the div from the dom
    gsap.to(document.querySelector('.close'), {
      scale: 0,
      duration: 0.5,
      onComplete: () => {
        document.querySelectorAll('.close').forEach((el) => {
          el.remove();
        });
      }
    })
    document.body.removeEventListener('keydown', handleEscape);
  }

  const fontProps: Partial<TextProps> = {
    font: "./soria-font.ttf",
    maxWidth: 2,
    anchorX: 'center',
    anchorY: 'bottom',
    fontSize: 0.7,
    color: 'white',
    textAlign: textAlign,
    fillOpacity: 0,
  };

  const onPointerOver = () => {
    if (isActive || isMobile) return;
    document.body.style.cursor = 'pointer';
    gsap.to(titleRef.current, {
      fillOpacity: 1
    });
    if (gridRef.current && hoverBoxRef.current) {
      gsap.to(gridRef.current.position, { z: 0.5, duration: 0.4});
      gsap.to(hoverBoxRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    }
  };

  const onPointerOut = () => {
    if (isMobile) return;
    document.body.style.cursor = 'auto';
    gsap.to(titleRef.current, {
      fillOpacity: 0
    });
    if (gridRef.current && hoverBoxRef.current) {
      gsap.to(gridRef.current.position, { z: 0, duration: 0.4});
      gsap.to(hoverBoxRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.4 });
    }
  };

  const getGeometry = () => {
    return <planeGeometry args={isMobile ? [MOBILE_TILE_W, MOBILE_TILE_H, 1] : [4, 4, 1]} />
  };

  return (
    <mesh ref={gridRef}
      position={position}
      onClick={portalInto}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}>
      { getGeometry() }
      <group>
        <mesh position={[0, 0, -0.01]} ref={hoverBoxRef} scale={[0, 0, 0]}>
          <boxGeometry args={[isMobile ? MOBILE_TILE_W : 4, isMobile ? MOBILE_TILE_H : 4, 0.5]}/>
          <meshPhysicalMaterial
            color="#444"
            transparent={true}
            opacity={0.3}
          />
          {!isMobile && <Edges color="white" lineWidth={3}/>}
        </mesh>
        {isMobile && !isActive && (
          <>
            {mobileCoverImage && (
              <MobileTileCover url={mobileCoverImage} width={MOBILE_TILE_W} height={MOBILE_TILE_H} />
            )}
            <Text
              position={[0, 0, 0.025]}
              {...fontProps}
              ref={titleRef}
              anchorX="center"
              anchorY="middle"
              fontSize={0.26}
              maxWidth={MOBILE_TILE_W - 0.35}
              textAlign="center"
              letterSpacing={0.04}
              fillOpacity={1}
            >
              {title}
            </Text>
          </>
        )}
        {!isMobile && (
          <Text position={[0, -1.8, 0.4]} {...fontProps} ref={titleRef}>
            {title}
          </Text>
        )}
      </group>
      <MeshPortalMaterial ref={portalRef} blend={0} resolution={0} blur={0}>
        <color attach="background" args={[color]} />
        {children}
      </MeshPortalMaterial>
    </mesh>
  );
}

export default GridTile;