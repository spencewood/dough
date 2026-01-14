import { defineEventHandler } from "nitro/h3";

/** Simple health check endpoint for Docker/load balancers */
export default defineEventHandler(() => {
	return { status: "ok" };
});
