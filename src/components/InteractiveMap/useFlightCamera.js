import { useEffect, useLayoutEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { CAMERA, CONTROLS, WORLD } from "./constants";
import { clampTarget, createRig, fitDistance, place } from "./framing";

// Plano del suelo contra el que se proyectan los eventos de puntero.
const GROUND = new THREE.Plane(
  new THREE.Vector3(0, 1, 0),
  -WORLD.groundY
);

// [x, z] por código de tecla. Arriba aleja del observador (-Z).
const KEY_STEPS = {
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
};

// Deja la cámara en el punto inicial antes del primer render: si esperáramos
// al primer useFrame, R3F dibujaría un frame con la cámara por defecto.
//
// El encuadre sale del tamaño real del lienzo, no de una constante: en un
// teléfono angosto hace falta más distancia para que el mapa entre entero.
// En cuanto el usuario mueve o hace zoom, fitDistance deja de imponerse.
function useFlightCamera() {
  const { camera, gl, size } = useThree();
  const [rig] = useState(createRig);

  useLayoutEffect(() => {
    if (!rig.touched) {
      const fit = fitDistance(size.width, size.height);
      if (fit !== null) {
        rig.distance = fit;
        rig.targetDistance = fit;
      }
    }

    place(camera, rig);
  }, [camera, rig, size.height, size.width]);

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const origin = new THREE.Vector3();
    const pointers = new Set();
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originZ = 0;

    // Sin pinza: con un segundo dedo el arrastre se cancela en vez de
    // teleportar la cámara.
    function project(clientX, clientY) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      camera.updateMatrixWorld();
      raycaster.setFromCamera(ndc, camera);

      return raycaster.ray.intersectPlane(GROUND, hit) ? hit : null;
    }

    function handlePointerDown(event) {
      pointers.add(event.pointerId);
      if (pointers.size > 1) {
        release(event);
        return;
      }

      const point = project(event.clientX, event.clientY);
      if (point === null) return;

      el.focus({ preventScroll: true });
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      origin.set(point.x, WORLD.groundY, point.z);
      originX = rig.targetX;
      originZ = rig.targetZ;
      rig.dragging = true;
      rig.moved = false;
      rig.touched = true;
      el.setPointerCapture?.(event.pointerId);
    }

    function handlePointerMove(event) {
      if (!rig.dragging || event.pointerId !== pointerId) return;

      if (
        Math.hypot(event.clientX - startX, event.clientY - startY) >
        CONTROLS.dragThresholdPx
      ) {
        rig.moved = true;
      }

      const point = project(event.clientX, event.clientY);
      if (point === null) return;

      // El punto agarrado se mantiene bajo el dedo: la cámara suma el mismo
      // desplazamiento que hizo el punto del suelo.
      rig.targetX = originX + (point.x - origin.x);
      rig.targetZ = originZ + (point.z - origin.z);
      clampTarget(rig);
    }

    function release(event) {
      pointers.delete(event.pointerId);
      if (el.hasPointerCapture?.(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      if (event.pointerId === pointerId) {
        rig.dragging = false;
        pointerId = null;
      }
    }

    function handleWheel(event) {
      event.preventDefault();
      const factor =
        event.deltaY > 0 ? CONTROLS.zoomStep : 1 / CONTROLS.zoomStep;

      rig.touched = true;
      rig.targetDistance = THREE.MathUtils.clamp(
        rig.targetDistance * factor,
        CAMERA.minDistance,
        CAMERA.maxDistance
      );
    }

    function handleKeyDown(event) {
      if (KEY_STEPS[event.code] === undefined) return;
      event.preventDefault();
      rig.touched = true;
      rig.keys.add(event.code);
    }

    function handleKeyUp(event) {
      rig.keys.delete(event.code);
    }

    function handleBlur() {
      rig.keys.clear();
    }

    el.tabIndex = 0;
    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("keydown", handleKeyDown);
    el.addEventListener("keyup", handleKeyUp);
    el.addEventListener("blur", handleBlur);

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointercancel", release);
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("keydown", handleKeyDown);
      el.removeEventListener("keyup", handleKeyUp);
      el.removeEventListener("blur", handleBlur);
      rig.keys.clear();
    };
  }, [camera, gl, rig]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, CONTROLS.maxDelta);

    let dirX = 0;
    let dirZ = 0;
    for (const code of rig.keys) {
      const [stepX, stepZ] = KEY_STEPS[code];
      dirX += stepX;
      dirZ += stepZ;
    }

    if (dirX !== 0 || dirZ !== 0) {
      const length = Math.hypot(dirX, dirZ);
      const step = (CONTROLS.keyboardSpeed * dt) / length;
      rig.targetX += (dirX / length) * step;
      rig.targetZ += (dirZ / length) * step;
      clampTarget(rig);
    }

    const k = 1 - Math.exp(-CONTROLS.focusDamping * dt);
    rig.x += (rig.targetX - rig.x) * k;
    rig.z += (rig.targetZ - rig.z) * k;
    rig.distance = THREE.MathUtils.damp(
      rig.distance,
      rig.targetDistance,
      CONTROLS.zoomDamping,
      dt
    );

    place(camera, rig);
  });

  return rig;
}

export { useFlightCamera };
