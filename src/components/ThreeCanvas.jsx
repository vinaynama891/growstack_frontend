import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeCanvas = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x3b82f6, 2, 50); // Blue
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 2, 50); // Emerald
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // 5. Geometries
    // A. Floating Particle Field (Stars)
    const particlesCount = 800;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const randomScales = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Random coordinates in a cube
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 15;
      randomScales[i / 3] = Math.random();
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Simple round particle using Canvas
    const createCircleTexture = () => {
      const matCanvas = document.createElement('canvas');
      matCanvas.width = 16;
      matCanvas.height = 16;
      const matContext = matCanvas.getContext('2d');
      const gradient = matContext.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      matContext.fillStyle = gradient;
      matContext.fillRect(0, 0, 16, 16);
      return new THREE.CanvasTexture(matCanvas);
    };

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      map: createCircleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x9ca3af
    });

    const starParticles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(starParticles);

    // B. Hero Core Object (Mesh)
    // We create a beautiful high-poly Torus Knot wireframe
    const torusKnotGeo = new THREE.TorusKnotGeometry(1.2, 0.4, 120, 16);
    
    // Wireframe material with standard shiny physical properties
    const torusKnotMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.3
    });

    const coreMesh = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    scene.add(coreMesh);

    // Initial position & scale
    coreMesh.position.set(2, 0, 0); // Position it to the right for layout balance

    // 6. Interaction Variables
    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Listeners
    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) - 0.5;
      targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for scroll and mouse
      scrollY += (targetScrollY - scrollY) * 0.1;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Rotate particle field slowly
      starParticles.rotation.y = elapsedTime * 0.02;
      starParticles.rotation.x = elapsedTime * 0.008;

      // 3D Morphing behavior on Scroll
      // Normalised scroll progress (roughly)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const scrollPercent = scrollY / maxScroll;

      // Rotate core mesh constantly, and accelerate it on scroll
      coreMesh.rotation.y = elapsedTime * 0.15 + scrollPercent * 4.0;
      coreMesh.rotation.x = elapsedTime * 0.1 + scrollPercent * 2.0;

      // Path of the object based on Scroll position:
      // Hero (scrollPercent = 0): right side, standard scale
      // About (scrollPercent = 0.25): center-right/left, rotates fast, color shifts
      // Services (scrollPercent = 0.5 - 0.7): backgrounds, moves left, shrinks
      // Contact (scrollPercent = 0.9+): center background, expands slightly, emerald tint
      
      let targetX = 2.0;
      let targetY = 0;
      let targetZ = 0;
      let targetScale = 1.0;
      let targetColor = new THREE.Color(0x3b82f6); // Blue
      let targetEmissive = new THREE.Color(0x1d4ed8);

      if (scrollPercent < 0.25) {
        // Hero to About transition
        const t = scrollPercent / 0.25;
        targetX = THREE.MathUtils.lerp(2.0, -1.8, t);
        targetY = THREE.MathUtils.lerp(0, 0.2, t);
        targetZ = THREE.MathUtils.lerp(0, 1.0, t);
        targetScale = THREE.MathUtils.lerp(1.0, 1.25, t);
        // Lerp color towards cyan/emerald
        targetColor.lerp(new THREE.Color(0x10b981), t);
      } else if (scrollPercent < 0.6) {
        // About to Services transition
        const t = (scrollPercent - 0.25) / 0.35;
        targetX = THREE.MathUtils.lerp(-1.8, 2.2, t);
        targetY = THREE.MathUtils.lerp(0.2, -0.5, t);
        targetZ = THREE.MathUtils.lerp(1.0, -2.0, t);
        targetScale = THREE.MathUtils.lerp(1.25, 0.8, t);
        targetColor = new THREE.Color(0x10b981); // Emerald
        targetColor.lerp(new THREE.Color(0x6366f1), t); // Indigo
      } else {
        // Services to Contact
        const t = Math.min((scrollPercent - 0.6) / 0.4, 1.0);
        targetX = THREE.MathUtils.lerp(2.2, 0, t);
        targetY = THREE.MathUtils.lerp(-0.5, 0, t);
        targetZ = THREE.MathUtils.lerp(-2.0, 1.5, t);
        targetScale = THREE.MathUtils.lerp(0.8, 1.3, t);
        targetColor = new THREE.Color(0x6366f1); // Indigo
        targetColor.lerp(new THREE.Color(0x3b82f6), t); // Back to blue
      }

      // Apply animated positions
      coreMesh.position.x = THREE.MathUtils.lerp(coreMesh.position.x, targetX, 0.1);
      coreMesh.position.y = THREE.MathUtils.lerp(coreMesh.position.y, targetY, 0.1);
      coreMesh.position.z = THREE.MathUtils.lerp(coreMesh.position.z, targetZ, 0.1);
      
      const s = THREE.MathUtils.lerp(coreMesh.scale.x, targetScale, 0.1);
      coreMesh.scale.set(s, s, s);
      
      // Interpolate Material properties
      torusKnotMat.color.lerp(targetColor, 0.1);

      // Parallax effect on camera using mouse position
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX * 2.5, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, -mouseY * 2.5, 0.05);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      torusKnotGeo.dispose();
      torusKnotMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div className="three-canvas-container" ref={containerRef} />;
};

export default ThreeCanvas;
