import * as THREE from "three";

import { CAMERA, WORLD } from "./constants";

// Toda la matemática de encuadre, sin React ni R3F, para poder probarla
// aparte. place() define dónde queda la cámara y fitDistance() a qué
// distancia entra el mapa completo.

function createRig() {
  return {
    x: WORLD.center.x,
    z: WORLD.center.z,
    targetX: WORLD.center.x,
    targetZ: WORLD.center.z,
    distance: CAMERA.startDistance,
    targetDistance: CAMERA.startDistance,
    // El usuario movió la cámara o hizo zoom: a partir de ahí el encuadre es
    // suyo y fitDistance() deja de imponerse.
    touched: false,
    dragging: false,
    // Si el puntero se movió durante esta pulsación. Lo consulta RegionMesh
    // para no confundir un arrastre con un clic.
    moved: false,
    keys: new Set(),
  };
}

function clampTarget(rig) {
  rig.targetX = THREE.MathUtils.clamp(rig.targetX, WORLD.minX, WORLD.maxX);
  rig.targetZ = THREE.MathUtils.clamp(rig.targetZ, WORLD.minZ, WORLD.maxZ);
}

// Coloca la cámara sobre el punto que mira. Con el pitch fijo, la dirección
// de vista es (0, -sin, -cos) y desde esa posición cae exacta en
// (x, groundY, z).
function place(camera, rig) {
  const sin = Math.sin(CAMERA.pitch);
  const cos = Math.cos(CAMERA.pitch);

  camera.position.set(
    rig.x,
    WORLD.groundY + rig.distance * sin,
    rig.z + rig.distance * cos
  );
  camera.rotation.set(-CAMERA.pitch, 0, 0);
}

// Distancia a la que el modelo completo entra en pantalla.
//
// El eje derecha de la cámara es el +X del mundo, así que a lo ancho solo
// cuenta la extensión en X. A lo alto entra la profundidad en Z, pero
// proyectada: con el pitch a 45° se ve acortada por sin(pitch).
//
// Sin esto, una sola constante no sirve: a 9 de distancia un teléfono de
// 390x844 (aspecto 0.46) muestra 3.44 de ancho y el modelo mide 4.33, así
// que Colombia abría cortada. Hace falta 11.3 en ese aspecto y solo 7.0 en
// uno cuadrado.
function fitDistance(width, height) {
  // Página aún fuera del layout: el lienzo mide 0 y no hay aspecto que sacar.
  if (!(width > 0) || !(height > 0)) return null;

  const aspect = width / height;
  const tan = Math.tan(THREE.MathUtils.degToRad(CAMERA.fov) / 2);
  const modelWidth = (WORLD.model.maxX - WORLD.model.minX) * WORLD.fitMargin;
  const modelHeight =
    (WORLD.model.maxZ - WORLD.model.minZ) *
    Math.sin(CAMERA.pitch) *
    WORLD.fitMargin;

  return THREE.MathUtils.clamp(
    Math.max(modelWidth / (2 * tan * aspect), modelHeight / (2 * tan)),
    CAMERA.minDistance,
    CAMERA.maxDistance
  );
}

export { clampTarget, createRig, fitDistance, place };
