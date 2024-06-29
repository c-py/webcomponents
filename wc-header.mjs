import { element, div, span } from "./wc.mjs";

export const header = element("wc-header", (state) => {
  return div({ children: [span({ text: "header" })] });
});
