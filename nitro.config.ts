import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
	// Tell Nitro where to find server routes
	scanDirs: ["server"],
});
