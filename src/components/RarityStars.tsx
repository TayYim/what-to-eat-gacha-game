import type { Rarity } from "../domain/types";

interface RarityStarsProps {
  rarity: Rarity;
  size?: "sm" | "md";
}

export function RarityStars({ rarity, size = "md" }: RarityStarsProps) {
  return (
    <span className={`rarity-stars rarity-stars--${size}`} aria-label={`${rarity} 星`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rarity ? "is-on" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}
