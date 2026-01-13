import { alertsHandlers } from "./alerts";
import { bakerHandlers } from "./baker";
import { dalHandlers } from "./dal";
import { nodeHandlers } from "./node";

export const handlers = [
	...nodeHandlers,
	...bakerHandlers,
	...dalHandlers,
	...alertsHandlers,
];
