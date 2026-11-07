import { BtnAnim } from "../BtnAnim";
import Sound from "../../assets/icons/sound";
import Stop from "../../assets/icons/stop";
import "./AudioButton.css";

// Botón de reproducción compartido por el lector y el comparador. Envuelve
// BtnAnim para no crear un estilo de botón nuevo.
function AudioButton({
  active = false,
  label = "la frase",
  color = "#2bb0fd",
  onClick,
  className = "",
}) {
  const Icon = active ? Stop : Sound;
  const action = active ? "Detener" : "Escuchar";

  return (
    <BtnAnim
      type="button"
      color={color}
      padding={10}
      borderRadius={12}
      shadowSize={5}
      className={`audio-button${active ? " audio-button--active" : ""} ${className}`.trim()}
      aria-label={`${action} ${label}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <Icon size={18} color="#fff" aria-hidden="true" />
    </BtnAnim>
  );
}

export { AudioButton };
