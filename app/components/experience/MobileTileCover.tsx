'use client';

import { useTexture } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';

type MobileTileCoverProps = {
  url: string;
  width: number;
  height: number;
};

/**
 * Full-bleed texture plane for mobile experience tiles (object-fit: cover).
 */
const MobileTileCover = ({ url, width, height }: MobileTileCoverProps) => {
  const texture = useTexture(url);

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  const { repeat, offset } = useMemo(() => {
    const image = texture.image as { width?: number; height?: number } | undefined;
    const iw = image?.width ?? 1;
    const ih = image?.height ?? 1;
    const planeAspect = width / height;
    const imageAspect = iw / ih;

    let repX = 1;
    let repY = 1;
    let offX = 0;
    let offY = 0;

    if (planeAspect > imageAspect) {
      repY = imageAspect / planeAspect;
      offY = (1 - repY) / 2;
    } else {
      repX = planeAspect / imageAspect;
      offX = (1 - repX) / 2;
    }

    return { repeat: [repX, repY] as [number, number], offset: [offX, offY] as [number, number] };
  }, [texture, width, height]);

  useLayoutEffect(() => {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
    texture.offset.set(offset[0], offset[1]);
    texture.needsUpdate = true;
  }, [texture, repeat, offset]);

  return (
    <group>
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[width, height, 1]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.009]}>
        <planeGeometry args={[width, height, 1]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
};

export default MobileTileCover;
