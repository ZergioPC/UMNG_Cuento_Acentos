import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useReducedMotion } from "./useReducedMotion";
import { CONTROLS, WATER, WORLD } from "./constants";
import { waterFragmentShader, waterVertexShader } from "./waterShader";

// El mar de fondo: un plano grande justo debajo de la base del GLB, con el
// shader cartoon de waterShader.js. Va detrás de todo (el mapa queda como
// una isla) y no interactúa con el puntero.
//
// props:
//   bases  nodos base del GLB, solo para sacar de su Box3 el nivel del agua
function WaterBackground({ bases }) {
  const reduced = useReducedMotion();
  const time = useRef(0);

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(WATER.size, WATER.size),
    []
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: waterVertexShader,
        fragmentShader: waterFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uBands: { value: WATER.bands },
          uFoamStrength: { value: WATER.foamStrength },
          uSparkle: { value: WATER.sparkle },
          uDeep: { value: new THREE.Color(WATER.deep) },
          uShallow: { value: new THREE.Color(WATER.shallow) },
          uFoam: { value: new THREE.Color(WATER.foam) },
          uCenter: { value: new THREE.Vector2(WORLD.center.x, WORLD.center.z) },
          uIsland: { value: new THREE.Vector2(WATER.island.x, WATER.island.z) },
          uShore: { value: new THREE.Vector2(WATER.shore.near, WATER.shore.far) },
        },
      }),
    []
  );

  // El nivel del mar sale del Box3 real de las bases y no de una constante:
  // el slab del GLB tiene su propio grosor, y con un Y fijo el plano o
  // tapaba el mapa o quedaba flotando en el aire.
  const level = useMemo(() => {
    const box = new THREE.Box3();
    bases.forEach((base) => box.expandByObject(base.object));
    return (box.isEmpty() ? WORLD.groundY : box.min.y) - WATER.drop;
  }, [bases]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((_, delta) => {
    // Con reduced-motion el mar se dibuja quieto: el tiempo no avanza y el
    // shader sigue pintando bandas y espuma, solo que congeladas.
    if (reduced) return;

    // El tiempo se acumula acá y no se lee de state.clock, igual que en
    // RegionMesh: al cambiar `frameloop` R3F reinicia el reloj y el mar
    // daría un salto al volver a la página del mapa.
    time.current += Math.min(delta, CONTROLS.maxDelta) * WATER.speed;
    material.uniforms.uTime.value = time.current;
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[WORLD.center.x, level, WORLD.center.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}

export { WaterBackground };
