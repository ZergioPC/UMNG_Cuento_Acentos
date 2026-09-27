// GLSL de las nubes. Vive aparte del componente para que el shader se pueda
// leer (y tocar) sin el ruido de R3F.
//
// El look es "pintado", como el del mar: la silueta sale de una distancia con
// signo (unión de tres círculos con la base plana, de las nubes dibujadas a
// mano en un cuento) y no de un degradado suave; el volumen son dos tonos
// cuantizados, tapa clara arriba y base gris abajo; y el borde se recorta por
// umbral con el ancho de un píxel (fwidth), no con un blur.
//
// No usa la posición del mundo como el mar: la nube viaja en su quad, y el
// ruido es local a la UV. Así el movimiento se controla desde el componente
// (mover el quad) y el noise no tiene que hacer wrap.

const cloudVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cloudFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBands;
  // Desfase por nube: con la misma semilla todas las nubes se deformarían
  // igual y se leería una sola nube repetida.
  uniform vec2 uSeed;
  uniform float uOpacity;
  uniform vec3 uTop;
  uniform vec3 uBottom;

  varying vec2 vUv;

  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 local = fract(p);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0, 1.0)), local.x),
      local.y
    );
  }

  void main() {
    // Silueta: tres lóbulos que se tocan, con la base aplastada para que la
    // nube se apoye en vez de ser una bola.
    vec2 p = vUv - vec2(0.5, 0.44);
    float shape = length(p - vec2(-0.23, 0.0)) - 0.20;
    shape = min(shape, length(p - vec2(0.01, 0.05)) - 0.27);
    shape = min(shape, length(p - vec2(0.24, 0.01)) - 0.19);
    shape = max(shape, 0.14 - vUv.y);

    // El noise solo "muerde" la silueta: es lo que separa una nube dibujada
    // de tres círculos. Dos octavas, una muy lenta para que la forma se
    // desplace con el tiempo sin bullir.
    float n =
      valueNoise(vUv * 3.0 + uSeed + vec2(uTime * 0.05, 0.0)) * 0.65 +
      valueNoise(vUv * 6.0 + uSeed * 1.7 - vec2(uTime * 0.09, uTime * 0.03)) * 0.35;
    shape += (n - 0.5) * 0.16;

    // fwidth sobre la distancia con signo da el ancho del píxel: el recorte
    // queda de un píxel pase lo que pase con el zoom, sin blur ni alpha test
    // binario que aliasea.
    float alpha = 1.0 - smoothstep(-fwidth(shape), fwidth(shape), shape);
    if (alpha < 0.01) discard;

    // Volumen en dos tonos, escalonados como las bandas del oleaje. El rango
    // del smoothstep es el de la silueta (vUv.y 0.17..0.71, ver los lóbulos de
    // arriba) para que la tapa llegue a uTop y la base a uBottom; el noise
    // descoloca el escalón, así no queda una línea recta horizontal.
    float lift = smoothstep(0.18, 0.66, vUv.y + (n - 0.5) * 0.5);
    float band = floor(lift * uBands) / uBands;
    vec3 color = mix(uBottom, uTop, band);

    gl_FragColor = vec4(color, alpha * uOpacity);

    // Sin estos dos includes el quad no pasa por tone mapping ni por la
    // conversión a sRGB, y las nubes quedarían más apagadas que el mapa, que
    // usa MeshStandardMaterial.
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export { cloudFragmentShader, cloudVertexShader };
