export type DisplayText = string | readonly string[];

export function displayTextToString(text: DisplayText) {
  if (typeof text === "string") return text;
  return text.join(" ");
}
