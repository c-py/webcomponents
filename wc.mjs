class WC {
  text = "";
  children = [];
  onclick;

  /**
   *
   * @param {"div" | "button" | "span" | "button" | "fragment" | string} tag
   * @param {Text & Clickable & Styled & Parent=} props
   */
  constructor(tag, props) {
    this.tag = tag;
    this.text = props?.text ?? "";
    this.onclick = props?.onclick;
    this.style = props?.style;
    this.children = props?.children ?? [];
  }
  /**
   *
   * @param {WC} child
   */
  append(child) {
    this.children.push(child);
  }

  render() {
    /**
     * @type {HTMLElement | DocumentFragment}
     */
    let element;

    switch (this.tag) {
      case "div":
        element = document.createElement(this.tag);
        break;
      case "span":
      case "button":
        element = document.createElement(this.tag);
        if (this.onclick) element.onclick = this.onclick;
        if (this.text !== undefined) element.textContent = this.text;
        for (const entry of Object.entries(this.style ?? {})) {
          element.style[entry[0]] = entry[1];
        }

        break;
      case "fragment":
        element = document.createDocumentFragment();
        break;
      default:
        element = document.createElement(this.tag);
        break;
    }

    this.children.forEach((child) => element.appendChild(child.render()));

    return element;
  }
}

/**
 * Render callback when state changes
 *
 * @callback render
 * @param {Object} state
 * @returns {WC}
 */

/**
 * Create a new Web Component
 *
 * @param {string} name
 * @param {render} render
 */
export const element = (name, render) => {
  const element = customElements.get(name);

  if (element) {
    element.prototype.connectedCallback = function () {
      this.shadowRoot.replaceChildren(render(this.state).render());
    };

    return () => new WC(name);
  }

  const hot = new EventSource("hot");

  hot.onmessage = (event) => {
    if (event.data !== `${name}.mjs`) return;
    import(`./${name}.mjs#time=${Date.now()}`);
  };

  customElements.define(
    name,
    class extends HTMLElement {
      shadowRoot;

      constructor() {
        super();

        this.shadowRoot = this.attachShadow({ mode: "open" });

        const observer = new MutationObserver((mutationList) => {
          mutationList.forEach((mutation) =>
            mutation.addedNodes.forEach((node) => {
              if (node.nodeName.startsWith("WC-")) {
                import(
                  `./${node.nodeName.toLowerCase()}.mjs#time=${Date.now()}`
                );
              }
            })
          );
        });

        observer.observe(this.shadowRoot, { childList: true, subtree: true });

        this.state = new Proxy(
          {},
          {
            set: (target, prop, value) => {
              Reflect.set(target, prop, value);
              this.connectedCallback?.();
              return true;
            },
          }
        );
      }

      connectedCallback() {
        this.shadowRoot.replaceChildren(render(this.state).render());
      }
    }
  );

  return () => new WC(name);
};

/**
 * @typedef {Object} Styled
 * @property {Object=} style
 */

/**
 * @typedef {Object} Text
 * @property {string=} text
 */

/**
 * @typedef {Object} Clickable
 * @property {Function=} onclick
 */

/**
 * @typedef {Object} Parent
 * @property {WC[]=} children
 */

/**
 *
 * @param {Parent=} props
 */
export const fragment = (props) => new WC("fragment", props);

/**
 *
 * @param {Parent=} props
 */
export const div = (props) => new WC("div", props);

/**
 *
 * @param {Text=} props
 */
export const span = (props) => new WC("span", props);

/**
 *
 * @param {Text & Clickable & Styled=} props
 */
export const button = (props) => new WC("button", props);
