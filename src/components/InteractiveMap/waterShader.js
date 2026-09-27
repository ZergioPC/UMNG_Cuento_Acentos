// GLSL del mar de fondo. Vive aparte del componente para que el shader se
// pueda leer (y tocar) sin el ruido de R3F.
//
// El look es "pintado", no fotorrealista: el oleaje se cuantiza en franjas de
// color planas, la espuma aparece por umbral (con borde duro, no como un
// brillo continuo) y los destellos son puntos en una grilla fija. Todo se
// calcula con la posición del mundo en XZ, así que las olas no se deforman
// con la perspectiva ni con el zoom de la cámara.

const waterVertexShader = /* glsl */ `
  varying vec2 vWorld;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBands;
  uniform float uFoamStrength;
  uniform float uSparkle;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  uniform vec2 uCenter;
  // Semiejes de la isla.
  uniform vec2 uIsland;
  // near / far de la franja de costa, en unidades de elipse.
  uniform vec2 uShore;

  varying vec2 vWorld;

  // Ruido barato y estable: sin textura, sin hash caro.
  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 p = vWorld;
    float t = uTime;

    // Tres trains de olas cruzados, cada uno con su dirección, frecuencia y
    // velocidad: con uno solo el mar se ve como una única onda gigante que se
    // repite siempre igual.
    float w1 = sin(dot(p, vec2(0.90, 0.44)) * 2.1 + t * 1.05);
    float w2 = sin(dot(p, vec2(-0.36, 0.93)) * 3.6 - t * 0.78);
    float w3 = sin(dot(p, vec2(0.62, -0.78)) * 7.3 + t * 1.65);
    float waves = (w1 * 0.52 + w2 * 0.31 + w3 * 0.17) * 0.5 + 0.5;

    // Cuantizar la altura de la ola es lo que da el aire cartoon: franjas de
    // color planas en vez de un degradado continuo.
    float band = floor(waves * uBands) / uBands;

    // Costa: distancia a la elipse de la isla. Cerca de la orilla el agua se
    // aclara hacia el turquesa.
    float shore = length((p - uCenter) / uIsland);
    float shallow = 1.0 - smoothstep(uShore.x, uShore.y, shore);

    vec3 color = mix(uDeep, uShallow, clamp(band * 0.8 + shallow * 0.6, 0.0, 1.0));

    // Espuma: umbral alto sobre las crestas (borde marcado, no difuminado) más
    // la línea de rompientes, que es la franja donde se apaga el agua clara y
    // se rompe en parches con la ola.
    float crest = smoothstep(0.80, 0.97, waves);
    float breakers = smoothstep(0.2, 0.55, shallow) * (1.0 - smoothstep(0.55, 0.9, shallow));
    float foam = clamp(crest * uFoamStrength + breakers * (0.3 + 0.7 * crest), 0.0, 1.0);
    color = mix(color, uFoam, foam);

    // Destellos: puntos redondos sobre una grilla fija (por eso no se ven como
    // ruido) que aparecen y se apagan.
    vec2 cell = floor(p * 4.0);
    vec2 local = fract(p * 4.0) - 0.5;
    float seed = hash21(cell);
    float twinkle = (1.0 - smoothstep(0.0, 0.2, length(local))) * step(0.94, seed);
    twinkle *= max(0.0, 0.5 + 0.5 * sin(t * 2.6 + seed * 31.0));
    color += twinkle * uSparkle;

    // Dither: el degradado costero usa muy pocos colores y en pantallas de 8
    // bits se ve bandead.
    color += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;

    gl_FragColor = vec4(color, 1.0);

    // Sin estos dos includes el plano no pasa por tone mapping ni por la
    // conversión a sRGB, y el agua quedaría más oscura y más apagada que el
    // resto de la escena, que usa MeshStandardMaterial.
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export { waterFragmentShader, waterVertexShader };
