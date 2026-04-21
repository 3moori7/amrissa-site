'use client';

import React, { JSX, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

type GLTFScene = GLTF & {
  scene: THREE.Group;
};

/**
 * Photo-derived depth mesh background for the Work portal.
 */
export const CampusDepthBackground = (props: JSX.IntrinsicElements['group']) => {
  const gltf = useGLTF('models/work-campus-depth.glb') as GLTFScene;
  const texture = useTexture('models/work-campus-photo.jpg');

  const texturedMaterial = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    // GLTF UVs are typically authored for non-flipped textures.
    texture.flipY = false;
    texture.needsUpdate = true;

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
  }, [texture]);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.material = texturedMaterial;
    });
    return clone;
  }, [gltf.scene, texturedMaterial]);

  return (
    <group {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload('models/work-campus-depth.glb');
useTexture.preload('models/work-campus-photo.jpg');

