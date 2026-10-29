import { CUENTOS, REGIONS, REGION_LABELS } from "../../db";

const QUIZ_SIZE = 10;
const MAX_PER_PHRASE = 2;

// Cuotas de la partida. Si un tipo no alcanza, los cupos se reparten entre los
// otros en buildGame().
const MIX = [
  { type: "region", quota: 4 },
  { type: "region-match", quota: 3 },
  { type: "true-false", quota: 3 },
];

function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function lowerLabel(region) {
  return REGION_LABELS[region].toLowerCase();
}

function phraseKey(question) {
  return `${question.folder}#${question.fraseId}`;
}

function baseQuestion(cuento, frase, highlightRegion) {
  return {
    cuentoTitle: cuento.title,
    folder: cuento.folder,
    fraseId: frase.id,
    highlightRegion,
    variants: frase.content,
  };
}

// La frase mostrada solo se puede asignar a una región si su texto no se repite
// en las otras dos. Las frases idénticas en varias regiones no sirven para
// opción múltiple.
function isUniqueVariant(variants, region) {
  return REGIONS.every(
    (other) => other === region || variants[other] !== variants[region]
  );
}

function makeRegionQuestion(cuento, frase, region) {
  return {
    ...baseQuestion(cuento, frase, region),
    id: `region-${cuento.folder}-${frase.id}-${region}`,
    type: "region",
    prompt: "¿De qué región es esta frase?",
    quote: frase.content[region],
    options: REGIONS.map((value) => ({
      id: value,
      label: REGION_LABELS[value],
      region: value,
    })),
    correctId: region,
    explanation: `Es la versión ${lowerLabel(region)} de «${cuento.title}».`,
  };
}

// Acá se muestran las tres variantes completas y se pregunta cuál pertenece a
// la región pedida. Solo se usa cuando las tres son distintas: si dos coinciden,
// habría dos respuestas válidas.
function makeRegionMatchQuestion(cuento, frase, region) {
  return {
    ...baseQuestion(cuento, frase, region),
    id: `region-match-${cuento.folder}-${frase.id}-${region}`,
    type: "region-match",
    prompt: `¿Cuál de estas frases es la versión ${lowerLabel(region)}?`,
    quote: null,
    options: REGIONS.map((value) => ({
      id: value,
      label: frase.content[value],
      region: value,
    })),
    correctId: region,
    explanation: `Es la versión ${lowerLabel(region)} de «${cuento.title}».`,
  };
}

// shown es la región cuyo texto se muestra; claimed es la región que afirma el
// enunciado. La respuesta es verdadera solo si coinciden. Para las falsas se
// exige que el texto de claimed sea distinto: si fuera igual, la afirmación
// también sería verdadera y la pregunta tendría dos respuestas correctas.
function makeTrueFalseQuestion(cuento, frase, shown, claimed) {
  const isTrue = shown === claimed;

  return {
    ...baseQuestion(cuento, frase, shown),
    id: `true-false-${cuento.folder}-${frase.id}-${shown}-${claimed}`,
    type: "true-false",
    prompt: `¿Esta frase es la versión ${lowerLabel(claimed)}?`,
    quote: frase.content[shown],
    options: [
      { id: "true", label: "Verdadero" },
      { id: "false", label: "Falso" },
    ],
    correctId: isTrue ? "true" : "false",
    explanation: isTrue
      ? `Es la versión ${lowerLabel(shown)} de «${cuento.title}».`
      : `La frase es la versión ${lowerLabel(shown)}. En ${lowerLabel(
          claimed
        )} se dice: «${frase.content[claimed]}».`,
  };
}

let poolsCache = null;

function buildPools() {
  const region = [];
  const regionMatch = [];
  const trueFalse = [];

  for (const cuento of CUENTOS) {
    for (const frase of cuento.frases) {
      const variants = frase.content;
      const distinct = new Set(REGIONS.map((value) => variants[value])).size;
      const varied = distinct > 1;

      if (distinct === 3) {
        for (const value of REGIONS) {
          regionMatch.push(makeRegionMatchQuestion(cuento, frase, value));
        }
      }

      for (const shown of REGIONS) {
        if (isUniqueVariant(variants, shown)) {
          region.push(makeRegionQuestion(cuento, frase, shown));
        }

        if (!varied) continue;

        trueFalse.push(makeTrueFalseQuestion(cuento, frase, shown, shown));

        // Una falsa por cada región cuyo texto sea distinto: así el pool tiene
        // variedad y ninguna afirmación falsa puede ser también verdadera.
        for (const claimed of REGIONS) {
          if (claimed !== shown && variants[claimed] !== variants[shown]) {
            trueFalse.push(
              makeTrueFalseQuestion(cuento, frase, shown, claimed)
            );
          }
        }
      }
    }
  }

  return {
    region: shuffle(region),
    "region-match": shuffle(regionMatch),
    "true-false": shuffle(trueFalse),
  };
}

function getPools() {
  poolsCache ??= buildPools();
  return poolsCache;
}

function buildGame(size = QUIZ_SIZE) {
  const cached = getPools();

  // Los pools se cachean para no recorrer los cuentos en cada partida, pero se
  // barajan de nuevo acá: si no, todas las partidas elegirían las mismas
  // primeras preguntas.
  const pools = {
    region: shuffle(cached.region),
    "region-match": shuffle(cached["region-match"]),
    "true-false": shuffle(cached["true-false"]),
  };

  const picked = [];
  const usedIds = new Set();
  const perPhrase = new Map();

  function take(pool, quota, ignorePhraseCap) {
    let taken = 0;

    for (const question of pool) {
      if (taken >= quota) break;
      if (usedIds.has(question.id)) continue;

      const key = phraseKey(question);
      const count = perPhrase.get(key) ?? 0;

      if (!ignorePhraseCap && count >= MAX_PER_PHRASE) continue;

      picked.push(question);
      usedIds.add(question.id);
      perPhrase.set(key, count + 1);
      taken += 1;
    }

    return taken;
  }

  for (const { type, quota } of MIX) {
    take(pools[type], quota, false);
  }

  // Reparte los cupos que no se pudieron llenar con el tipo que los tenía
  // asignados.
  if (picked.length < size) {
    for (const { type } of MIX) {
      if (picked.length >= size) break;
      take(pools[type], size - picked.length, false);
    }
  }

  // Último recurso: si el pool es muy chico, se permite una tercera pregunta de
  // la misma frase antes que devolver una partida incompleta.
  if (picked.length < size) {
    for (const { type } of MIX) {
      if (picked.length >= size) break;
      take(pools[type], size - picked.length, true);
    }
  }

  return shuffle(picked).slice(0, size);
}

// Extensión futura de audio: cuando existan los mp3 con la convención
// src/db/<cuento>/audio/<fraseId>_<region>.mp3, agregar acá un generador que
// llame a resolveClip() y una cuota de tipo "audio" en MIX. El resto de la
// trivia (puntaje, ranking y navegación) no necesita cambios.

export { QUIZ_SIZE, buildGame };
