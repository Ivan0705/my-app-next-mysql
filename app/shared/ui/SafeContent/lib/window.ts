import { JSDOM } from "jsdom";

export const window = new JSDOM("").window;
