import { REGIONS, REGION_LABELS } from "../../../db";
import {
  REGION_ICONS,
  REGION_PALETTES,
} from "../../../utils/CuentoComparer/constants";

function TriviaVariants({ variants, highlightRegion }) {
  return (
    <div className="trivia-variants">
      <h3 className="trivia-variants__title">Así se dice en cada región</h3>

      <ul className="trivia-variants__list">
        {REGIONS.map((region) => {
          const Icon = REGION_ICONS[region] ?? null;
          const active = region === highlightRegion;

          return (
            <li
              key={region}
              className={`trivia-variants__row${
                active ? " trivia-variants__row--active" : ""
              }`}
              data-region={region}
            >
              <span className="trivia-variants__region">
                {Icon && <Icon size={20} color={REGION_PALETTES[region].border} />}
                <span>{REGION_LABELS[region]}</span>
              </span>
              <p className="trivia-variants__text">{variants[region]}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { TriviaVariants };
