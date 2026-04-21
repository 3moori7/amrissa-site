'use client';

import React, { JSX, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
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
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      const material = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(material)) {
        material.forEach((m) => {
          if ('side' in m) m.side = THREE.DoubleSide;
        });
      } else if (material && 'side' in material) {
        material.side = THREE.DoubleSide;
      }
    });
    return clone;
  }, [gltf.scene]);

  return (
    <group {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload('models/work-campus-depth.glb');

