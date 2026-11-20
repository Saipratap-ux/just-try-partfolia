import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface HeroUniverseCanvasProps {
  theme: 'dark' | 'light';
  orbitEnabled: boolean;
  resetCounter: number;
}

// Pre-allocated math helpers (zero GC inside animation loop)
const _mat4 = new THREE.Matrix4();
const _vec3 = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();
const _color = new THREE.Color();

function detectSoftwareWebGL(): { supported: boolean; isSoftwareGl: boolean } {
  if (typeof window === 'undefined') return { supported: false, isSoftwareGl: true };
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return { supported: false, isSoftwareGl: true };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: true };
  }
}

export const HeroUniverseCanvas: React.FC<HeroUniverseCanvasProps> = ({
  theme,
  orbitEnabled,
  resetCounter,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const themeRef = useRef(theme);
  const orbitEnabledRef = useRef(orbitEnabled);
  const resetFlagRef = useRef(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    orbitEnabledRef.current = orbitEnabled;
  }, [orbitEnabled]);

  useEffect(() => {
    if (resetCounter > 0) {
      resetFlagRef.current = true;
    }
  }, [resetCounter]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { supported, isSoftwareGl } = detectSoftwareWebGL();
    if (!supported) {
      setWebglUnavailable(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const darkBg = new THREE.Color(0x050814);
    const lightBg = new THREE.Color(0xf1f5f9);
    const activeBg = themeRef.current === 'dark' ? darkBg.clone() : lightBg.clone();
    scene.background = activeBg;
    scene.fog = new THREE.FogExp2(activeBg.getHex(), 0.032);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 120);
    const initialCamPos = new THREE.Vector3(0, 0.6, 10.5);
    camera.position.copy(initialCamPos);

    // Studio reflection environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    // Balanced 3-point + hemisphere studio rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.1);
    keyLight.position.set(7, 9, 8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
    fillLight.position.set(-8, -3, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 1.5);
    rimLight.position.set(0, 6, -9);
    scene.add(rimLight);

    // Offset cosmic core slightly to right on wide viewports so left hero typography breathes
    const worldGroup = new THREE.Group();
    const updateCoreOffset = (w: number) => {
      worldGroup.position.x = w >= 1024 ? 2.6 : 0;
      worldGroup.position.y = w >= 1024 ? 0.15 : -0.4;
      const s = w >= 1024 ? 1.0 : 0.78;
      worldGroup.scale.setScalar(s);
    };
    updateCoreOffset(width);
    scene.add(worldGroup);

    // Composite 10-part Cosmic Orbital Core (THREE.Group)
    const coreGroup = new THREE.Group();
    worldGroup.add(coreGroup);

    // 1. Faceted crystalline shell
    const crystalGeo = new THREE.IcosahedronGeometry(1.12, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      metalness: 0.22,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      iridescence: 0.85,
      iridescenceIOR: 1.35,
      transparent: true,
      opacity: isSoftwareGl ? 0.65 : 0.86,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystalMesh);

    // 2. Inner glowing energy nucleus
    const nucleusGeo = new THREE.OctahedronGeometry(0.6, 1);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.4,
      metalness: 0.1,
      roughness: 0.35,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleusMesh);

    // 3. Outer geometric wireframe cage
    const cageGeo = new THREE.IcosahedronGeometry(1.48, 1);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      wireframe: true,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.32,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cageMesh);

    // 4. Primary brushed-titanium equatorial gyroscope ring
    const ring1Geo = new THREE.TorusGeometry(2.02, 0.048, 24, 96);
    const titaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0xcbd5e1,
      metalness: 0.92,
      roughness: 0.18,
      anisotropy: 0.8,
    });
    const ring1 = new THREE.Mesh(ring1Geo, titaniumMat);
    ring1.rotation.x = Math.PI * 0.36;
    ring1.rotation.y = Math.PI * 0.12;
    coreGroup.add(ring1);

    // 5. Ring clamp brackets (distinct matte dark slate contrast >= 0.25 roughness delta)
    const bracketGeo = new THREE.BoxGeometry(0.22, 0.16, 0.18);
    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.4,
      roughness: 0.58,
    });
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const bracket = new THREE.Mesh(bracketGeo, bracketMat);
      bracket.position.set(Math.cos(angle) * 2.02, Math.sin(angle) * 2.02, 0);
      bracket.rotation.z = angle;
      ring1.add(bracket);
    }

    // 6. Secondary electric-blue orbital ring
    const ring2Geo = new THREE.TorusGeometry(2.54, 0.032, 20, 96);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.55,
      metalness: 0.85,
      roughness: 0.22,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.y = Math.PI * 0.42;
    coreGroup.add(ring2);

    // 7. Tertiary violet polar ring
    const ring3Geo = new THREE.TorusGeometry(2.96, 0.024, 16, 96);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.24,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI * 0.52;
    ring3.rotation.z = Math.PI * 0.22;
    coreGroup.add(ring3);

    // 8. Orbiting technology polyhedron satellites (6 distinct nodes)
    const nodeOrbitGroup = new THREE.Group();
    worldGroup.add(nodeOrbitGroup);

    const nodeSpecs = [
      { geo: new THREE.OctahedronGeometry(0.18, 0), color: 0x38bdf8, radius: 2.35, speed: 0.55, yAmp: 0.45, phase: 0 },
      { geo: new THREE.DodecahedronGeometry(0.17, 0), color: 0x8b5cf6, radius: 2.75, speed: -0.42, yAmp: 0.65, phase: 1.1 },
      { geo: new THREE.BoxGeometry(0.24, 0.24, 0.24), color: 0x3b82f6, radius: 3.15, speed: 0.36, yAmp: 0.55, phase: 2.2 },
      { geo: new THREE.TetrahedronGeometry(0.2, 0), color: 0x22d3ee, radius: 2.55, speed: -0.5, yAmp: 0.72, phase: 3.4 },
      { geo: new THREE.TorusGeometry(0.14, 0.05, 12, 24), color: 0x60a5fa, radius: 3.3, speed: 0.31, yAmp: 0.48, phase: 4.5 },
      { geo: new THREE.CylinderGeometry(0.12, 0.12, 0.26, 6), color: 0xa78bfa, radius: 2.9, speed: -0.38, yAmp: 0.6, phase: 5.4 },
    ];

    const orbitingNodes: {
      mesh: THREE.Mesh;
      radius: number;
      speed: number;
      yAmp: number;
      phase: number;
    }[] = [];

    nodeSpecs.forEach((spec) => {
      const mat = new THREE.MeshStandardMaterial({
        color: spec.color,
        emissive: spec.color,
        emissiveIntensity: 0.35,
        metalness: 0.75,
        roughness: 0.25,
      });
      const mesh = new THREE.Mesh(spec.geo, mat);
      nodeOrbitGroup.add(mesh);
      orbitingNodes.push({
        mesh,
        radius: spec.radius,
        speed: spec.speed,
        yAmp: spec.yAmp,
        phase: spec.phase,
      });
    });

    // 9. Equatorial instanced orbital micro-beads (64 instances)
    const beadCount = 64;
    const beadGeo = new THREE.OctahedronGeometry(0.036, 0);
    const beadMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    const beadInstanced = new THREE.InstancedMesh(beadGeo, beadMat, beadCount);
    for (let i = 0; i < beadCount; i++) {
      const a = (i / beadCount) * Math.PI * 2;
      const r = 3.55 + (i % 3) * 0.12;
      _vec3.set(Math.cos(a) * r, Math.sin(a * 3) * 0.14, Math.sin(a) * r);
      _quat.identity();
      _scale.setScalar(0.8 + (i % 4) * 0.18);
      _mat4.compose(_vec3, _quat, _scale);
      beadInstanced.setMatrixAt(i, _mat4);
    }
    beadInstanced.instanceMatrix.needsUpdate = true;
    beadInstanced.computeBoundingSphere();
    worldGroup.add(beadInstanced);

    // 10. Deep-space starfield (1,100 instanced stars)
    const starCount = 1100;
    const starGeo = new THREE.OctahedronGeometry(0.038, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starsMesh = new THREE.InstancedMesh(starGeo, starMat, starCount);
    const paletteHex = [0xffffff, 0x38bdf8, 0x60a5fa, 0xa78bfa, 0x93c5fd];

    for (let i = 0; i < starCount; i++) {
      const r = 10 + Math.random() * 38;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      _vec3.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi) - 6,
      );
      _euler.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      _quat.setFromEuler(_euler);
      _scale.setScalar(0.45 + Math.random() * 1.15);
      _mat4.compose(_vec3, _quat, _scale);
      starsMesh.setMatrixAt(i, _mat4);
      _color.setHex(paletteHex[i % paletteHex.length]);
      starsMesh.setColorAt(i, _color);
    }
    starsMesh.instanceMatrix.needsUpdate = true;
    if (starsMesh.instanceColor) starsMesh.instanceColor.needsUpdate = true;
    starsMesh.computeBoundingSphere();
    scene.add(starsMesh);

    // OrbitControls (active only when user enables interactive 3D inspection mode)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 5.5;
    controls.maxDistance = 17;
    controls.enabled = orbitEnabledRef.current;

    // Pointer parallax & scroll tracking
    let targetPointerX = 0;
    let targetPointerY = 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;
    let scrollFactor = 0;

    const handlePointerMove = (e: PointerEvent) => {
      targetPointerX = (e.clientX / window.innerWidth) * 2 - 1;
      targetPointerY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scrollFactor = Math.min(1.5, window.scrollY / Math.max(1, window.innerHeight));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateCoreOffset(w);
    };
    window.addEventListener('resize', handleResize);

    // WebGL context loss safety
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let disposed = false;
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync && gl.deleteSync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth theme background transition
      const targetBg = themeRef.current === 'dark' ? darkBg : lightBg;
      activeBg.lerp(targetBg, Math.min(1, delta * 5));
      (scene.background as THREE.Color).copy(activeBg);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(activeBg);
      }
      starMat.color.setHex(themeRef.current === 'dark' ? 0xffffff : 0x3b82f6);

      // Controls sync
      controls.enabled = orbitEnabledRef.current;
      if (resetFlagRef.current) {
        camera.position.lerp(initialCamPos, 1);
        controls.target.set(0, 0, 0);
        controls.update();
        resetFlagRef.current = false;
      }

      if (!prefersReducedMotion) {
        smoothPointerX = THREE.MathUtils.damp(smoothPointerX, targetPointerX, 4.5, delta);
        smoothPointerY = THREE.MathUtils.damp(smoothPointerY, targetPointerY, 4.5, delta);

        // Rotate composite core smoothly
        crystalMesh.rotation.y += delta * 0.24;
        crystalMesh.rotation.x += delta * 0.12;
        nucleusMesh.rotation.y -= delta * 0.45;
        cageMesh.rotation.y -= delta * 0.14;
        cageMesh.rotation.z += delta * 0.08;

        ring1.rotation.z += delta * 0.28;
        ring2.rotation.z -= delta * 0.22;
        ring3.rotation.y += delta * 0.18;

        beadInstanced.rotation.y += delta * 0.1;
        starsMesh.rotation.y += delta * 0.015;

        // Orbiting tech polyhedra
        for (let i = 0; i < orbitingNodes.length; i++) {
          const n = orbitingNodes[i];
          const angle = elapsed * n.speed + n.phase;
          n.mesh.position.set(
            Math.cos(angle) * n.radius,
            Math.sin(angle * 1.4) * n.yAmp,
            Math.sin(angle) * n.radius,
          );
          n.mesh.rotation.x += delta * 0.8;
          n.mesh.rotation.y += delta * 1.1;
        }

        // Pointer & scroll reactive tilt
        coreGroup.rotation.y = THREE.MathUtils.damp(
          coreGroup.rotation.y,
          smoothPointerX * 0.42,
          4,
          delta,
        );
        coreGroup.rotation.x = THREE.MathUtils.damp(
          coreGroup.rotation.x,
          -smoothPointerY * 0.28 + scrollFactor * 0.35,
          4,
          delta,
        );
        worldGroup.position.z = THREE.MathUtils.damp(
          worldGroup.position.z,
          -scrollFactor * 2.2,
          4,
          delta,
        );
      }

      if (controls.enabled) {
        controls.update();
      }

      renderer.render(scene, camera);

      if (prefersReducedMotion) {
        return; // Single clean frame when reduced motion is preferred
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      controls.dispose();
      envTex.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglUnavailable || contextLost) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 overflow-hidden bg-slate-100 dark:bg-[#050814]"
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              theme === 'dark'
                ? 'radial-gradient(circle at 72% 40%, rgba(59,130,246,0.22), transparent 52%), radial-gradient(circle at 25% 75%, rgba(139,92,246,0.16), transparent 45%)'
                : 'radial-gradient(circle at 72% 40%, rgba(37,99,235,0.14), transparent 52%), radial-gradient(circle at 25% 75%, rgba(124,58,237,0.10), transparent 45%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`fixed inset-0 z-0 transition-opacity duration-500 ${
        orbitEnabled ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      }`}
    />
  );
};
