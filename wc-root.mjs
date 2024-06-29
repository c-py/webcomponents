import { element, div, span, button } from "./wc.mjs";
import { header } from "./wc-header.mjs";

element("wc-root", (state) => {
  console.log("HI");
  state.count ??= 0;

  return div({
    children: [
      div({ children: [header()] }),
      span({ text: state.count }),
      button({
        text: "click me",
        onclick: () => {
          console.log("WOOT");
          state.count++;
        },
        style: {
          "background-color": "blue",
        },
      }),
    ],
  });
});
