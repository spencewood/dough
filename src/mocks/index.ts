export async function initMocks() {
	if (typeof window !== "undefined" && import.meta.env.DEV) {
		const { worker } = await import("./browser");
		await worker.start({
			onUnhandledRequest: "bypass", // Don't warn about unhandled requests
		});
		console.log("[MSW] Mock Service Worker started");
	}
}
