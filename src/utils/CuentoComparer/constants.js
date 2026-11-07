// src/utils/CuentoComparer/constants.js
import IconCaribe from "../../assets/icons/icon_caribe";
import IconLlanos from "../../assets/icons/icon_llanos";
import IconAndina from "../../assets/icons/icon_andina";

export const VIEW_ORDER = ["caribe", "orinoquia", "andina"];

export const REGION_PALETTES = {
  andina: { background: "#fdf3d8", border: "#ff9f22", color: "#8d5f09" },
  orinoquia: { background: "#d9f2e4", border: "#67c73b", color: "#233d0b" },
  caribe: { background: "#fde2e2", border: "#dcd935", color: "#4a490d" },
};

export const REGION_ICONS = {
  caribe: IconCaribe,
  orinoquia: IconLlanos,
  andina: IconAndina,
};
