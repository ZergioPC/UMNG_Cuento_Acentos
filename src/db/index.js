import cuento_1 from "./cuento_1/cuento_1.json";
import cuento_2 from "./cuento_2/cuento_2.json";
import cuento_3 from "./cuento_3/cuento_3.json";
import cuento_4 from "./cuento_4/cuento_4.json";
import cuento_5 from "./cuento_5/cuento_5.json";

const REGIONS = ["andina", "caribe", "orinoquia"];

const REGION_LABELS = {
  andina: "Andina",
  caribe: "Caribe",
  orinoquia: "Orinoquia",
};

// Los mp3 viven en src/assets/audio/<audioFolder>/<region>_<n>.mp3, donde
// n = frase.id + 1. La carpeta de audio no coincide con la carpeta del JSON,
// así que el mapeo se declara una sola vez acá.
const AUDIO_FOLDERS = {
  cuento_1: "El_Silbon",
  cuento_2: "Bola_fuego",
  cuento_3: "La_Sayona",
  cuento_4: "El_Carrao",
  cuento_5: "El_Duende",
};

function buildCuento(json, folder) {
  return {
    id: json.title,
    folder,
    audioFolder: AUDIO_FOLDERS[folder],
    title: json.title,
    frases: json.dialogs,
  };
}

const CUENTOS = [cuento_1, cuento_2, cuento_3, cuento_4, cuento_5].map(
  (json, index) => buildCuento(json, `cuento_${index + 1}`)
);

export { CUENTOS, REGIONS, REGION_LABELS };
