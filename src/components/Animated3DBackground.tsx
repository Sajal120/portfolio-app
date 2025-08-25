import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Advanced DNA Helix Structure
function DNAHelix() {
  const helixRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      helixRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const helixPoints = useMemo(() => {
    const points1: THREE.Vector3[] = [];
    const points2: THREE.Vector3[] = [];
    
    for (let i = 0; i < 100; i++) {
      const t = (i / 100) * Math.PI * 4;
      const radius = 1.5;
      const height = (i / 100) * 6 - 3;
      
      points1.push(new THREE.Vector3(
        Math.cos(t) * radius,
        height,
        Math.sin(t) * radius
      ));
      
      points2.push(new THREE.Vector3(
        Math.cos(t + Math.PI) * radius,
        height,
        Math.sin(t + Math.PI) * radius
      ));
    }
    
    return { points1, points2 };
  }, []);

  return (
    <group ref={helixRef}>
      {/* DNA Strands */}
      {helixPoints.points1.map((point, i) => (
        <mesh key={`strand1-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color="#00d4ff" 
            emissive="#00d4ff"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {helixPoints.points2.map((point, i) => (
        <mesh key={`strand2-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color="#ff6b6b" 
            emissive="#ff6b6b"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* Connecting bridges */}
      {helixPoints.points1.map((point1, i) => {
        if (i % 5 === 0 && helixPoints.points2[i]) {
          const point2 = helixPoints.points2[i];
          const midPoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
          
          return (
            <mesh key={`bridge-${i}`} position={[midPoint.x, midPoint.y, midPoint.z]}>
              <cylinderGeometry args={[0.02, 0.02, point1.distanceTo(point2), 8]} />
              <meshStandardMaterial 
                color="#4ecdc4" 
                transparent 
                opacity={0.6}
                emissive="#4ecdc4"
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}

// Floating Data Nodes
function DataNodes() {
  const nodesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (nodesRef.current) {
      nodesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      nodesRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.1;
      
      nodesRef.current.children.forEach((child, index) => {
        child.position.y += Math.sin(state.clock.elapsedTime + index) * 0.001;
        child.rotation.y += 0.01;
        child.rotation.x += 0.005;
      });
    }
  });

  const nodePositions = useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 8,
      scale: 0.5 + Math.random() * 0.5,
      color: Math.random() > 0.5 ? "#45b7d1" : "#9b59b6"
    }));
  }, []);

  return (
    <group ref={nodesRef}>
      {nodePositions.map((pos, i) => (
        <mesh 
          key={i}
          position={[pos.x, pos.y, pos.z]}
          scale={pos.scale}
        >
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial 
            color={pos.color}
            transparent 
            opacity={0.7}
            emissive={pos.color}
            emissiveIntensity={0.4}
            wireframe={i % 3 === 0}
          />
        </mesh>
      ))}
    </group>
  );
}

// Particle Field
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Majestic 3D Dragon
function Dragon() {
  const dragonRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (dragonRef.current) {
      // Gentle floating motion
      dragonRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      dragonRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      
      // Wing flapping animation
      const wingFlap = Math.sin(state.clock.elapsedTime * 4) * 0.3;
      dragonRef.current.children.forEach((child, index) => {
        if (child.userData.type === 'wing') {
          child.rotation.z = (child.userData.side === 'left' ? 1 : -1) * (0.2 + wingFlap);
        }
      });
    }
  });

  return (
    <group ref={dragonRef} position={[0, 0, 0]} scale={0.8}>
      {/* Dragon Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 2, 8]} />
        <meshStandardMaterial 
          color="#8B0000" 
          emissive="#4B0000"
          emissiveIntensity={0.3}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Dragon Head */}
      <mesh position={[0, 0.8, 0.8]}>
        <coneGeometry args={[0.5, 0.8, 8]} />
        <meshStandardMaterial 
          color="#A0522D" 
          emissive="#654321"
          emissiveIntensity={0.2}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>
      
      {/* Dragon Eyes */}
      <mesh position={[-0.2, 1.1, 1.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0.2, 1.1, 1.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Dragon Tail */}
      <mesh position={[0, -0.8, -1.2]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.2, 1.5, 8]} />
        <meshStandardMaterial 
          color="#8B0000" 
          emissive="#4B0000"
          emissiveIntensity={0.3}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Left Wing */}
      <mesh 
        position={[-0.8, 0.2, 0]} 
        rotation={[0, 0, 0.2]}
        userData={{ type: 'wing', side: 'left' }}
      >
        <coneGeometry args={[1.2, 0.1, 3]} />
        <meshStandardMaterial 
          color="#2F4F4F" 
          transparent 
          opacity={0.7}
          emissive="#1C3A3A"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Right Wing */}
      <mesh 
        position={[0.8, 0.2, 0]} 
        rotation={[0, 0, -0.2]}
        userData={{ type: 'wing', side: 'right' }}
      >
        <coneGeometry args={[1.2, 0.1, 3]} />
        <meshStandardMaterial 
          color="#2F4F4F" 
          transparent 
          opacity={0.7}
          emissive="#1C3A3A"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Dragon Spikes along back */}
      {[...Array(5)].map((_, i) => (
        <mesh 
          key={i} 
          position={[0, 0.4, -0.8 + i * 0.4]} 
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial 
            color="#8B0000" 
            emissive="#4B0000"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      
      {/* Dragon Legs */}
      <mesh position={[-0.3, -0.8, 0.3]}>
        <cylinderGeometry args={[0.08, 0.12, 0.6, 6]} />
        <meshStandardMaterial 
          color="#A0522D" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.3, -0.8, 0.3]}>
        <cylinderGeometry args={[0.08, 0.12, 0.6, 6]} />
        <meshStandardMaterial 
          color="#A0522D" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[-0.3, -0.8, -0.3]}>
        <cylinderGeometry args={[0.08, 0.12, 0.6, 6]} />
        <meshStandardMaterial 
          color="#A0522D" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.3, -0.8, -0.3]}>
        <cylinderGeometry args={[0.08, 0.12, 0.6, 6]} />
        <meshStandardMaterial 
          color="#A0522D" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Fire Breath Effect */}
      <mesh position={[0, 0.8, 1.4]}>
        <coneGeometry args={[0.15, 0.6, 8]} />
        <meshStandardMaterial 
          color="#FF4500" 
          transparent 
          opacity={0.8}
          emissive="#FF4500"
          emissiveIntensity={0.9}
        />
      </mesh>
      <mesh position={[0, 0.8, 1.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#FFD700" 
          transparent 
          opacity={0.6}
          emissive="#FFD700"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

// Energy Rings
function EnergyRings() {
  const ringsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, index) => {
        ring.rotation.z = state.clock.elapsedTime * (0.2 + index * 0.1);
        ring.rotation.y = state.clock.elapsedTime * (0.1 + index * 0.05);
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
        ring.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={ringsRef}>
      {[1.5, 2.5, 3.5].map((radius, index) => (
        <mesh key={index} rotation={[Math.PI / 2 * index, 0, 0]}>
          <torusGeometry args={[radius, 0.05, 16, 100]} />
          <meshStandardMaterial 
            color={index === 0 ? "#00d4ff" : index === 1 ? "#ff6b6b" : "#4ecdc4"}
            transparent 
            opacity={0.4 - index * 0.1}
            emissive={index === 0 ? "#00d4ff" : index === 1 ? "#ff6b6b" : "#4ecdc4"}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main 3D Scene
function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff6b6b" />
      <pointLight position={[0, 10, -10]} intensity={0.8} color="#4ecdc4" />
      <pointLight position={[5, 5, 0]} intensity={1.2} color="#FFD700" />
      
      <Dragon />
      <DNAHelix />
      <DataNodes />
      <ParticleField />
      <EnergyRings />
    </>
  );
}

// Main component
const Animated3DBackground = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 75 }}
        style={{
          background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 70%)'
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default Animated3DBackground;