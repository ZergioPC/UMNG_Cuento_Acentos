import { BtnSimple } from "../BtnSimple";
import BackSign from "../../assets/icons/back_sign";

function TriviaHeader({ title, onBack, backLabel = "Volver" }) {
  return (
    <header className="trivia-header">
      <BtnSimple
        icon={BackSign}
        onClick={onBack}
        aria-label={backLabel}
        hoverColor="#1e7bb1"
      />
      <h1 className="trivia-header__title">{title}</h1>
    </header>
  );
}

export { TriviaHeader };
