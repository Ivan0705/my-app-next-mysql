import DOMPurify from "dompurify";
import { window } from "./window";

export const purify = DOMPurify(
  window as unknown as {
    DocumentFragment: typeof DocumentFragment;
    HTMLTemplateElement: typeof HTMLTemplateElement;
    Node: typeof Node;
    Element: typeof Element;
    NodeFilter: typeof NodeFilter;
    NamedNodeMap: typeof NamedNodeMap;
    HTMLFormElement: typeof HTMLFormElement;
    DOMParser: typeof DOMParser;
  }
);
