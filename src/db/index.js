import cuento_1 from "./cuento_1/cuento_1.json";
import cuento_2 from "./cuento_2/cuento_2.json";
import cuento_3 from "./cuento_3/cuento_3.json";
import cuento_4 from "./cuento_4/cuento_4.json";
import cuento_5 from "./cuento_5/cuento_5.json";
import cuento_6 from "./cuento_6/cuento_6.json";
import cuento_7 from "./cuento_7/cuento_7.json";

const REGIONS = ["paisa", "rolo", "costeño"];

const REGION_LABELS = {
  paisa: "Paisa",
  rolo: "Rolo",
  costeño: "Costeño",
};

function buildCuento(json, folder) {
  return {
    id: json[0].title,
    folder,
    title: json[0].title,
    frases: json.slice(1),
  };
}

const CUENTOS = [
  cuento_1,
  cuento_2,
  cuento_3,
  cuento_4,
  cuento_5,
  cuento_6,
  cuento_7,
].map((json, index) => buildCuento(json, `cuento_${index + 1}`));

export { CUENTOS, REGIONS, REGION_LABELS };