import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { createEarthCanvasTexture, createCloudCanvasTexture } from './earthTexture';

export interface GlobeCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
  temp?: number;
}

export const MAJOR_GLOBE_CITIES: GlobeCity[] = [
  { name: 'Delhi', country: 'IN', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
  { name: 'San Francisco', country: 'US', lat: 37.7749, lon: -122.4194 },
  { name: 'Rio de Janeiro', country: 'BR', lat: -22.9068, lon: -43.1729 },
  { name: 'Cairo', country: 'EG', lat: 30.0444, lon: 31.2357 },
  { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
  { name: 'Toronto', country: 'CA', lat: 43.6532, lon: -79.3832 },
  { name: 'Bangkok', country: 'TH', lat: 13.7563, lon: 100.5018 },
  { name: 'Cape Town', country: 'ZA', lat: -33.9249, lon: 18.4241 },
];

interface GlobeCanvasProps {
  onSelectLocation: (loc: { lat: number; lon: number; name?: string }) => void;
  hoveredCity: GlobeCity | null;
  setHoveredCity: (city: GlobeCity | null) => void;
  autoRotate: boolean;
  targetFocus: { lat: number; lon: number } | null;
  isLocationSelected: boolean;
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  onSelectLocation,
  setHoveredCity,
  autoRotate,
  targetFocus,
  isLocationSelected,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const targetRotationRef = useRef({ x: 0.3, y: 0 });
  const targetCameraZRef = useRef(5.2);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lastInteractionTimeRef = useRef(Date.now());
  const cityMarkersRef = useRef<Array<{ mesh: THREE.Mesh; beacon: THREE.Mesh; city: GlobeCity }>>([]);

  const latLonToVector3 = useCallback((lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  const vector3ToLatLon = useCallback((vec: THREE.Vector3) => {
    const norm = vec.clone().normalize();
    const lat = 90 - Math.acos(norm.y) * (180 / Math.PI);
    const lon = ((Math.atan2(norm.z, -norm.x) * 180) / Math.PI) - 180;
    const normalizedLon = lon < -180 ? lon + 360 : lon > 180 ? lon - 360 : lon;
    return { lat, lon: normalizedLon };
  }, []);

  // Handle focus and zoom smoothly when targetFocus changes
  useEffect(() => {
    if (targetFocus) {
      const { lat, lon } = targetFocus;
      // Calculate target rotation to bring coordinates to front center
      const targetY = -(lon + 90) * (Math.PI / 180);
      const targetX = lat * (Math.PI / 180);
      targetRotationRef.current = { x: targetX, y: targetY };
      // Smoothly zoom in to focus distance
      targetCameraZRef.current = 3.3;
      lastInteractionTimeRef.current = Date.now();
    } else {
      // Zoom out to global orbit overview when cleared
      targetCameraZRef.current = 5.2;
    }
  }, [targetFocus]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Cosmic Ambient Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 120;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = -30 + (Math.random() - 0.5) * 60;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.6,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 1.2);
    dirLight2.position.set(-5, -2, -3);
    scene.add(dirLight2);

    // 4. Earth Sphere Group
    const earthGroup = new THREE.Group();
    earthGroupRef.current = earthGroup;
    scene.add(earthGroup);

    const sphereRadius = 1.8;
    const earthTexture = createEarthCanvasTexture();
    const earthGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.45,
      metalness: 0.2,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.15,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // 5. Cloud Sphere Layer
    const cloudTexture = createCloudCanvasTexture();
    const cloudGeometry = new THREE.SphereGeometry(sphereRadius * 1.018, 48, 48);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earthGroup.add(cloudMesh);

    // 6. Atmospheric Outer Rim Glow
    const atmosphereGeometry = new THREE.SphereGeometry(sphereRadius * 1.15, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.0, 0.85, 1.0, 1.0) * intensity * 0.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 7. Add City Pins & Pulsing Beacons
    cityMarkersRef.current = [];
    const markerGeometry = new THREE.SphereGeometry(0.035, 16, 16);
    const beaconGeometry = new THREE.RingGeometry(0.04, 0.07, 24);

    MAJOR_GLOBE_CITIES.forEach(city => {
      const pos = latLonToVector3(city.lat, city.lon, sphereRadius * 1.02);

      // Core Marker
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const marker = new THREE.Mesh(markerGeometry, markerMat);
      marker.position.copy(pos);
      marker.userData = { city };
      earthGroup.add(marker);

      // Glowing Beacon Ring
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const beacon = new THREE.Mesh(beaconGeometry, beaconMat);
      beacon.position.copy(pos.clone().multiplyScalar(1.002));
      beacon.lookAt(new THREE.Vector3(0, 0, 0));
      earthGroup.add(beacon);

      cityMarkersRef.current.push({ mesh: marker, beacon, city });
    });

    // 8. Raycasting and Interaction Setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getRaycastIntersects = (e: MouseEvent | Touch) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      return raycaster.intersectObjects([earthMesh, ...cityMarkersRef.current.map(c => c.mesh)]);
    };

    // Mouse / Pointer Event Handlers
    const onPointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      lastInteractionTimeRef.current = Date.now();
    };

    const onPointerMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        targetRotationRef.current.y += deltaX * 0.005;
        targetRotationRef.current.x += deltaY * 0.005;

        // Clamp latitude pitch so globe doesn't flip upside down
        targetRotationRef.current.x = Math.max(-1.4, Math.min(1.4, targetRotationRef.current.x));

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
        lastInteractionTimeRef.current = Date.now();
      } else {
        // Check hover over city pins
        const intersects = getRaycastIntersects(e);
        if (intersects.length > 0) {
          const hitObj = intersects[0].object;
          if (hitObj.userData && hitObj.userData.city) {
            setHoveredCity(hitObj.userData.city);
            renderer.domElement.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredCity(null);
        renderer.domElement.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      if (renderer.domElement) {
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onClick = (e: MouseEvent) => {
      const intersects = getRaycastIntersects(e);
      if (intersects.length > 0) {
        const hit = intersects[0];
        if (hit.object.userData && hit.object.userData.city) {
          const c: GlobeCity = hit.object.userData.city;
          onSelectLocation({ lat: c.lat, lon: c.lon, name: c.name });
          return;
        }

        // Raycast hit on the Earth mesh surface
        const localPoint = earthGroup.worldToLocal(hit.point.clone());
        const { lat, lon } = vector3ToLatLon(localPoint);
        onSelectLocation({ lat, lon });
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCameraZRef.current += e.deltaY * 0.003;
      targetCameraZRef.current = Math.max(2.8, Math.min(8.0, targetCameraZRef.current));
      lastInteractionTimeRef.current = Date.now();
    };

    // Touch Support Handlers
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistRef.current = Math.hypot(dx, dy);
      }
      lastInteractionTimeRef.current = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

        targetRotationRef.current.y += deltaX * 0.005;
        targetRotationRef.current.x += deltaY * 0.005;
        targetRotationRef.current.x = Math.max(-1.4, Math.min(1.4, targetRotationRef.current.x));

        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = (touchStartDistRef.current - dist) * 0.01;
        targetCameraZRef.current = Math.max(2.8, Math.min(8.0, targetCameraZRef.current + factor));
        touchStartDistRef.current = dist;
      }
      lastInteractionTimeRef.current = Date.now();
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      touchStartDistRef.current = null;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElement.addEventListener('click', onClick);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    domElement.addEventListener('touchend', onTouchEnd);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Master 60FPS Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Auto-rotation ONLY when not actively dragged AND no location is currently selected
      const timeSinceInteraction = Date.now() - lastInteractionTimeRef.current;
      if (autoRotate && !isLocationSelected && !isDraggingRef.current && timeSinceInteraction > 1500) {
        targetRotationRef.current.y += 0.0035;
      }

      // Smooth camera zoom interpolation
      camera.position.z += (targetCameraZRef.current - camera.position.z) * 0.08;

      // Smooth damping interpolation for rotation
      earthGroup.rotation.y += (targetRotationRef.current.y - earthGroup.rotation.y) * 0.08;
      earthGroup.rotation.x += (targetRotationRef.current.x - earthGroup.rotation.x) * 0.08;

      // Rotate clouds slightly faster for atmospheric dynamics
      cloudMesh.rotation.y += 0.001;

      // Animate pulsing beacon rings
      cityMarkersRef.current.forEach((item, idx) => {
        const pulse = 1 + 0.3 * Math.sin(time * 3 + idx);
        item.beacon.scale.set(pulse, pulse, 1);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('click', onClick);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
      domElement.removeEventListener('touchend', onTouchEnd);

      if (domElement && domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }

      // Dispose Three.js objects & textures to avoid GPU leaks
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      markerGeometry.dispose();
      beaconGeometry.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      earthTexture.dispose();
      cloudTexture.dispose();
      renderer.dispose();
    };
  }, [latLonToVector3, vector3ToLatLon, onSelectLocation, setHoveredCity, autoRotate]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
