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
// Detalle importante del GLB: la geometría viene con vértices partidos (las
// normales son planas por cara), pero EdgesGeometry no compara índices sino
// posiciones hasheadas, así que las aristas se emparejan solas. No hace falta
// mergeVertices, que además rompería las normales del modelo.
//
// Cuesta unos 20-50 ms por región (todo el trabajo es EdgesGeometry), así que
// se llama una sola vez por montaje y nunca en un useFrame.

function topContour(geometry, options = {}) {
  if (geometry === null || geometry === undefined) return null;

  const { threshold = OUTLINE.threshold, band = OUTLINE.band } = options;

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

  return kept.length > 0 ? kept : null;
}

export { topContour };
