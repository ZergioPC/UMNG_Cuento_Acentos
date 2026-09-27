import * as THREE from "three";

import { OUTLINE } from "./constants";

// Matemática pura del borde toon, sin React ni R3F.
//
// Las regiones del GLB son slabs extruidos: la cara de arriba es plana y la
// costa está en el 100% de su grosor, así que el contorno que interesa es el
// que cae en la banda superior. EdgesGeometry con umbral de ángulo entrega
// solo los quiebres de verdad (la costa, el bisel y las paredes), porque las
// aristas coplanares del interior de la cara tienen 0° y se descartan solas;
// después se filtra por altura para quedarse con la cara de arriba y tirar las
// paredes.
//
// Devuelve un Array plano de [x0, y0, z0, x1, y1, z1, ...] porque así lo quiere
// el <Line segments> de drei: hace points.map(...).flat(), y un Float32Array no
// tiene flat. No "optimizarlo" a Float32Array.
//
// El borde sale con demasiado detalle para el grosor del trazo: la costa de
// Caribe son ~474 aristas de ~1 px en pantalla, con un serrucho de mediana
// 0.8 px y p90 6.8 px a escala de escritorio. Con un trazo de ese orden el
// borde no se lee como una línea sino como turbulencia (el usuario lo reportó
// como "ruido amarillo oscuro", que es el color del borde). Por eso las
// cadenas se suavizan con Douglas-Peucker antes de emitirse: se va primero el
// detalle de alta frecuencia, que es el que el trazo no puede representar, y
// se conservan los accidentes grandes de la costa. Con OUTLINE.smooth en 0 la
// suavización se desactiva y queda el borde crudo.
//
// Detalle importante del GLB: la geometría viene con vértices partidos (las
// normales son planas por cara), pero EdgesGeometry no compara índices sino
// posiciones hasheadas, así que las aristas se emparejan solas. No hace falta
// mergeVertices, que además rompería las normales del modelo.
//
// Cuesta unos 20-50 ms por región (todo el trabajo es EdgesGeometry), así que
// se llama una sola vez por montaje y nunca en un useFrame.

// Agrupa los segmentos en cadenas de puntos cosidas por posición. El borde del
// GLB no siempre es un lazo cerrado: si falta una arista de la costa (el umbral
// de ángulo la descarta) la cadena queda abierta, y abrirla a la fuerza
// dibujaría una recta falsa cruzando el mapa. Por eso se marca `closed` y solo
// se cierra el anillo cuando la caminata vuelve de verdad al punto inicial.
function chainSegments(flat) {
  const count = flat.length / 6;
  const keys = new Map();
  const coords = [];

  const vertexOf = (x, y, z) => {
    const key = `${x.toFixed(5)},${y.toFixed(5)},${z.toFixed(5)}`;
    let id = keys.get(key);
    if (id === undefined) {
      id = coords.length / 3;
      keys.set(key, id);
      coords.push(x, y, z);
    }
    return id;
  };

  const pairs = new Array(count);
  for (let i = 0; i < count; i += 1) {
    const o = i * 6;
    pairs[i] = [
      vertexOf(flat[o], flat[o + 1], flat[o + 2]),
      vertexOf(flat[o + 3], flat[o + 4], flat[o + 5])
    ];
  }

  const incident = new Array(coords.length / 3);
  for (let i = 0; i < count; i += 1) {
    for (const vertex of pairs[i]) {
      if (incident[vertex] === undefined) incident[vertex] = [];
      incident[vertex].push(i);
    }
  }

  const used = new Uint8Array(count);
  const chains = [];
  for (let seed = 0; seed < count; seed += 1) {
    if (used[seed] === 1) continue;
    used[seed] = 1;

    const start = pairs[seed][0];
    let vertex = pairs[seed][1];
    // Los dos extremos de la arista semilla entran en la cadena: si solo se
    // guardara el de salida, esa arista se perdería y el anillo se cortaría con
    // un salto recto por encima de la costa.
    const order = [start, vertex];
    let closed = false;

    for (let guard = 0; guard < count; guard += 1) {
      const step = incident[vertex];
      const next = step === undefined ? undefined : step.find((i) => used[i] === 0);
      if (next === undefined) break;
      used[next] = 1;
      vertex = pairs[next][0] === vertex ? pairs[next][1] : pairs[next][0];
      if (vertex === start) {
        closed = true;
        break;
      }
      order.push(vertex);
    }

    if (order.length >= (closed === true ? 3 : 2)) chains.push({ order, closed });
  }

  return { coords, chains };
}

// Douglas-Peucker sobre una lista de vértices, en el plano XZ (la banda de
// altura ya garantiza que todos están en la cara de arriba). Se trabaja con una
// pila explícita y no con recursión porque las cadenas más largas son de
// cientos de vértices.
function simplifyOrder(order, coords, tolerance) {
  const pointAt = (index) => {
    const base = order[index] * 3;
    return [coords[base], coords[base + 2]];
  };

  const keep = new Uint8Array(order.length);
  keep[0] = 1;
  keep[order.length - 1] = 1;
  const stack = [[0, order.length - 1]];

  while (stack.length > 0) {
    const [from, to] = stack.pop();
    const [ax, az] = pointAt(from);
    const [bx, bz] = pointAt(to);
    const vx = bx - ax;
    const vz = bz - az;
    const length = Math.hypot(vx, vz);

    let farthest = -1;
    let farthestIndex = -1;
    for (let i = from + 1; i < to; i += 1) {
      const [px, pz] = pointAt(i);
      const cx = px - ax;
      const cz = pz - az;
      // Distancia al segmento, no a la recta que lo contiene: en una bahía o
      // un saliente la punta se proyecta fuera del chord, y midiendo contra la
      // recta infinita esa punta parecería cerca cuando en realidad el trazo
      // se la comería. Con el segmento la tolerancia es una garantía real.
      const t = length < 1e-9 ? 0 : Math.max(0, Math.min(1, (cx * vx + cz * vz) / (length * length)));
      const dx = cx - t * vx;
      const dz = cz - t * vz;
      const distance = Math.hypot(dx, dz);
      if (distance > farthest) {
        farthest = distance;
        farthestIndex = i;
      }
    }

    if (farthest > tolerance && farthestIndex > 0) {
      keep[farthestIndex] = 1;
      stack.push([from, farthestIndex], [farthestIndex, to]);
    }
  }

  const kept = [];
  for (let i = 0; i < order.length; i += 1) {
    if (keep[i] === 1) kept.push(order[i]);
  }
  return kept;
}

// Para un anillo no se puede fijar el primer y el último punto (son el mismo),
// así que se parte en dos cadenas por los dos vértices más separados. Obliga a
// conservar dos accidentes grandes de la costa y deja el resto libre.
function splitRing(order, coords) {
  const at = (id) => {
    const base = id * 3;
    return [coords[base], coords[base + 2]];
  };

  let cx = 0;
  let cz = 0;
  for (const id of order) {
    const [x, z] = at(id);
    cx += x;
    cz += z;
  }
  cx /= order.length;
  cz /= order.length;

  let first = 0;
  let best = -1;
  for (let i = 0; i < order.length; i += 1) {
    const [x, z] = at(order[i]);
    const d = (x - cx) ** 2 + (z - cz) ** 2;
    if (d > best) {
      best = d;
      first = i;
    }
  }

  const [ax, az] = at(order[first]);
  let second = 0;
  best = -1;
  for (let i = 0; i < order.length; i += 1) {
    const [x, z] = at(order[i]);
    const d = (x - ax) ** 2 + (z - az) ** 2;
    if (d > best) {
      best = d;
      second = i;
    }
  }

  const head = [];
  for (let i = first; ; i = (i + 1) % order.length) {
    head.push(order[i]);
    if (i === second) break;
  }
  const tail = [];
  for (let i = second; ; i = (i + 1) % order.length) {
    tail.push(order[i]);
    if (i === first) break;
  }

  return [head, tail];
}

function topContour(geometry, options = {}) {
  if (geometry === null || geometry === undefined) return null;

  const {
    threshold = OUTLINE.threshold,
    band = OUTLINE.band,
    smooth = OUTLINE.smooth
  } = options;

  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box === null) return null;

  const height = box.max.y - box.min.y;
  // Un slab plano (o degenerado) no tiene banda que dibujar.
  if (!(height > 0)) return null;

  const limit = box.max.y - height * band;
  const edges = new THREE.EdgesGeometry(geometry, threshold);
  const source = edges.attributes.position.array;

  const kept = [];
  for (let i = 0; i < source.length; i += 6) {
    // Los dos extremos del segmento tienen que estar en la banda: con uno
    // solo, una arista de la pared (que va de la base a la cara) entraría.
    if (source[i + 1] > limit && source[i + 4] > limit) {
      kept.push(
        source[i],
        source[i + 1],
        source[i + 2],
        source[i + 3],
        source[i + 4],
        source[i + 5]
      );
    }
  }

  // La geometría de Edges es temporal: solo se copian sus posiciones.
  edges.dispose();

  if (kept.length === 0) return null;
  if (!(smooth > 0)) return kept;

  // La tolerancia es una fracción de la diagonal de la región para que el
  // suavizado no dependa de a qué tamaño se vea el mapa.
  const diagonal = Math.hypot(box.max.x - box.min.x, box.max.z - box.min.z);
  const tolerance = diagonal * smooth;
  if (!(tolerance > 0)) return kept;

  const { coords, chains } = chainSegments(kept);
  const simplified = [];
  for (const { order, closed } of chains) {
    const pieces = closed === true ? splitRing(order, coords) : [order];
    let ring = [];
    for (let i = 0; i < pieces.length; i += 1) {
      const piece = simplifyOrder(pieces[i], coords, tolerance);
      if (i > 0) piece.shift();
      ring = ring.concat(piece);
    }
    if (ring.length >= (closed === true ? 3 : 2)) simplified.push({ ring, closed });
  }

  const out = [];
  for (const { ring, closed } of simplified) {
    const total = ring.length;
    const last = closed === true ? total : total - 1;
    for (let i = 0; i < last; i += 1) {
      const from = ring[i];
      const to = ring[(i + 1) % total];
      // Un vértice repetido (donde la costa tiene bifurcaciones) no aporta nada
      // y genera una instancia degenerada en el Line2.
      if (from === to) continue;
      const a = from * 3;
      const b = to * 3;
      out.push(coords[a], coords[a + 1], coords[a + 2], coords[b], coords[b + 1], coords[b + 2]);
    }
  }

  return out.length > 0 ? out : null;
}

export { topContour };
