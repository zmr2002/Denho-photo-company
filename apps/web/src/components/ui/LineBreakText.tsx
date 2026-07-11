import type { DisplayText } from "@/lib/text/display-text";

interface LineBreakTextProps {
  text: DisplayText;
}

const cjkPattern = /[\u3040-\u30ff\u3400-\u9fff\u3000-\u303f\uff00-\uffef]/;
const phraseBreakPattern = /([、。，．！？!?：:；;／/])/;

function splitCjkPhrases(text: string) {
  const parts = text.split(phraseBreakPattern);
  const phrases: string[] = [];

  for (let index = 0; index < parts.length; index += 2) {
    const phrase = `${parts[index] ?? ""}${parts[index + 1] ?? ""}`;
    if (phrase) phrases.push(phrase);
  }

  return phrases.length > 0 ? phrases : [text];
}

export function LineBreakText({ text }: LineBreakTextProps) {
  if (typeof text === "string" && !cjkPattern.test(text)) {
    return <>{text}</>;
  }

  if (typeof text !== "string") {
    return (
      <>
        {text.map((line) => (
          <span className="display-line" key={line}>
            {line}
          </span>
        ))}
      </>
    );
  }

  return (
    <>
      {splitCjkPhrases(text).map((phrase, index) => (
        <span className="display-phrase" key={`${phrase}-${index}`}>
          {phrase}
        </span>
      ))}
    </>
  );
}
