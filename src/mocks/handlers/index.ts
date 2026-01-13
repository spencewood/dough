import { alertsHandlers } from "./alerts";
import { bakerHandlers } from "./baker";
import { dalHandlers } from "./dal";
import { nodeHandlers } from "./node";
import { settingsHandlers } from "./settings";

export const handlers = [
	...nodeHandlers,
	...bakerHandlers,
	...dalHandlers,
	...alertsHandlers,
	...settingsHandlers,
];
