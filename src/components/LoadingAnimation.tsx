import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LoadingAnimationProps {
  onComplete: () => void;
}

// 3D Loading Cube
function LoadingCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.8;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial 
        color="#00d4ff" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

// Orbiting Particles
function OrbitingParticles() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3;
        return (
          <mesh 
            key={i} 
            position={[
              Math.cos(angle) * radius, 
              Math.sin(angle * 2) * 0.5, 
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#ff6b6b" : "#4ecdc4"} 
              emissive={i % 2 === 0 ? "#ff6b6b" : "#4ecdc4"}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Floating Rings
function FloatingRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = state.clock.elapsedTime * 0.4;
      ring1Ref.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = state.clock.elapsedTime * 0.3;
      ring2Ref.current.rotation.x = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial 
          color="#45b7d1" 
          transparent 
          opacity={0.6}
          emissive="#45b7d1"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.05, 16, 100]} />
        <meshStandardMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={0.4}
          emissive="#ff6b6b"
          emissiveIntensity={0.2}
        />
      </mesh>
    </>
  );
}

// 3D Scene
function LoadingScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00d4ff" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#ff6b6b" />
      
      <LoadingCube />
      <OrbitingParticles />
      <FloatingRings />
    </>
  );
}

const LoadingAnimation = ({ onComplete }: LoadingAnimationProps) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Initial setup
    gsap.set([logoRef.current, percentageRef.current], { opacity: 0, y: 50, scale: 0.8 });
    gsap.set(progressBarRef.current, { width: "0%" });
    gsap.set(canvasRef.current, { opacity: 0, scale: 0.5 });

    // 3D Canvas entrance
    tl.to(canvasRef.current, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "back.out(1.7)"
    });

    // Logo and percentage fade in with bounce
    tl.to([logoRef.current, percentageRef.current], {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "back.out(1.7)",
      stagger: 0.2
    }, "-=0.5");

    // Progress bar animation with counter
    tl.to(progressBarRef.current, {
      width: "100%",
      duration: 3,
      ease: "power2.out",
      onUpdate: function() {
        const currentProgress = Math.round(this.progress() * 100);
        setProgress(currentProgress);
        if (percentageRef.current) {
          percentageRef.current.textContent = `${currentProgress}%`;
        }
      }
    }, "-=0.3");

    // Completion pulse effect
    tl.to(logoRef.current, {
      scale: 1.1,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });

    // Exit animation
    tl.to([logoRef.current, percentageRef.current], {
      opacity: 0,
      y: -50,
      scale: 0.8,
      duration: 0.8,
      ease: "power2.in",
      delay: 0.5,
      stagger: 0.1
    });

    tl.to(canvasRef.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.8,
      ease: "power2.in"
    }, "-=0.6");

    tl.to(preloaderRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        onComplete();
      }
    }, "-=0.4");

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-background overflow-hidden"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-20 grid-rows-20 w-full h-full">
          {[...Array(400)].map((_, i) => (
            <div
              key={i}
              className="border border-primary/20"
              style={{
                animationDelay: `${Math.random() * 3}s`,
                animation: `pulse 3s infinite ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={canvasRef} className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ background: 'transparent' }}
        >
          <LoadingScene />
        </Canvas>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo/Name */}
        <div ref={logoRef} className="mb-12">
          <h1 className="text-7xl md:text-9xl font-bold text-glow mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Sajal
            </span>
          </h1>
          <div className="relative">
            <p className="text-2xl text-muted-foreground font-light tracking-wider">
              AI & IT Enthusiast
            </p>
            <div className="absolute -inset-2 bg-gradient-primary opacity-20 blur-xl rounded-full" />
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-96 mx-auto">
          <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            <div
              ref={progressBarRef}
              className="absolute top-0 left-0 h-full bg-gradient-primary rounded-full shadow-lg"
              style={{ 
                width: "0%",
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
              }}
            />
          </div>
          
          {/* Percentage */}
          <div
            ref={percentageRef}
            className="text-lg text-primary font-mono font-bold mt-6 tracking-wider"
            style={{ textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}
          >
            0%
          </div>
        </div>

        {/* Status text */}
        <div className="mt-8 text-sm text-muted-foreground/60 font-light">
          {progress < 20 && "Initializing development environment..."}
          {progress >= 20 && progress < 40 && "Loading AI-enhanced tools..."}
          {progress >= 40 && progress < 60 && "Configuring security protocols..."}
          {progress >= 60 && progress < 80 && "Setting up IT infrastructure..."}
          {progress >= 80 && progress < 95 && "Optimizing system performance..."}
          {progress >= 95 && "Ready to innovate..."}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-primary/30" />
    </div>
  );
};

export default LoadingAnimation;