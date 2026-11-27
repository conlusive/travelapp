import type { CSSProperties } from "react";

type Props = {
  text: string;
  /** words — по словах (заголовки); letters — по літерах (великі назви). */
  by?: "words" | "letters";
  /** load — одразу після появи в DOM; scroll — коли блок Reveal потрапляє на екран. */
  trigger?: "load" | "scroll";
};

const delay = (index: number) => ({ "--i": index }) as CSSProperties;

/** Текст, що «виїжджає» з-під маски. Для скрінрідерів лишається звичайним реченням. */
export function AnimatedTitle({ text, by = "words", trigger = "load" }: Props) {
  // Дефіс теж місце переносу: «Ріо-де-Жанейро» мусить вміститися на вузькому екрані.
  const words = text.split(/(?<=[ -])/);
  const motion = trigger === "load" ? "animate-mask-up" : "reveal-word";
  let letter = 0;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`}>
            {/* Відступи в масці не дають обрізати хвости літер (р, у, Д). */}
            <span className="-my-[0.14em] inline-block overflow-hidden py-[0.14em] align-bottom whitespace-nowrap">
              {by === "words" ? (
                <span className={`inline-block ${motion}`} style={delay(wordIndex)}>
                  {word.trimEnd()}
                </span>
              ) : (
                [...word.trimEnd()].map((character, i) => (
                  <span key={i} className={`inline-block ${motion}`} style={delay(letter++ * 0.5)}>
                    {character}
                  </span>
                ))
              )}
            </span>
            {word.endsWith(" ") && " "}
          </span>
        ))}
      </span>
    </>
  );
}
