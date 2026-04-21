'use client';

import React, { JSX, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Photo-derived depth mesh background for the Work portal.
 */
export const CampusDepthBackground = (props: JSX.IntrinsicElements['group']) => {
  const texture = useTexture('models/work-campus-photo.jpg');

  const depthGeometry = useMemo(() => {
    const image = texture.image as HTMLImageElement | undefined;
    if (!image?.width || !image?.height) return null;

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height).data;
    const sampleDepth = (u: number, v: number) => {
      const x = Math.min(image.width - 1, Math.max(0, Math.floor(u * (image.width - 1))));
      const y = Math.min(image.height - 1, Math.max(0, Math.floor((1 - v) * (image.height - 1))));
      const idx = (y * image.width + x) * 4;
      const r = imageData[idx] / 255;
      const g = imageData[idx + 1] / 255;
      const b = imageData[idx + 2] / 255;
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      // Brighter sky/background moves away; darker foreground pops toward camera.
      return (0.5 - Math.pow(luma, 1.25)) * 0.28;
    };

    const aspect = image.height / image.width;
    const width = 2.1;
    const height = width * aspect;
    const segX = 260;
    const segY = Math.max(120, Math.round(segX * aspect));

    const geometry = new THREE.PlaneGeometry(width, height, segX, segY);
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const uvs = geometry.attributes.uv as THREE.BufferAttribute;

    for (let i = 0; i < positions.count; i += 1) {
      const u = uvs.getX(i);
      const v = uvs.getY(i);
      positions.setZ(i, sampleDepth(u, v));
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, [texture]);

  const texturedMaterial = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.flipY = false;
    texture.needsUpdate = true;

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
  }, [texture]);

  if (!depthGeometry) return null;

  return (
    <group {...props} dispose={null}>
      <mesh geometry={depthGeometry} material={texturedMaterial} receiveShadow />
    </group>
  );
};

useTexture.preload('models/work-campus-photo.jpg');

