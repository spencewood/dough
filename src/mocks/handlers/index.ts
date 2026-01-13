import { bakerHandlers } from "./baker";
import { nodeHandlers } from "./node";

export const handlers = [...nodeHandlers, ...bakerHandlers];
