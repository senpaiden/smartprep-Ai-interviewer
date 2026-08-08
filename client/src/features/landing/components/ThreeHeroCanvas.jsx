import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '../shaders/shaders.js';

const AnimatedSphere = () => {
  const mesh = useRef();
  
  // Create custom shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x06b6d4) } // Teal color
      },
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: true
    });
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.2;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.3;
      material.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <Sphere ref={mesh} args={[2, 64, 64]}>
      <primitive object={material} attach="material" />
    </Sphere>
  );
};

const ThreeHeroCanvas = () => {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
};

export default ThreeHeroCanvas;
