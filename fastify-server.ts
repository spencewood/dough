import Fastify, {
	type FastifyReply,
	type FastifyRequest,
} from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import type { WebSocket } from "ws";
import { toNodeHandler } from "srvx/node";
import type { NodeHttp1Handler } from "srvx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

const fastify = Fastify({
	logger: true,
});

// Register WebSocket plugin
await fastify.register(fastifyWebsocket);

// API routes registration (before the catch-all)
async function registerApiRoutes(
	fastify: ReturnType<typeof Fastify>,
	viteDevServer?: Awaited<ReturnType<typeof import("vite").createServer>>,
) {
	// Helper to load modules (handles dev vs prod)
	async function loadModule<T>(modulePath: string): Promise<T> {
		if (DEVELOPMENT && viteDevServer) {
			return viteDevServer.ssrLoadModule(modulePath) as Promise<T>;
		}
		return import(modulePath);
	}

	// Health check
	fastify.get("/api/health", async () => {
		return { status: "ok" };
	});

	// Settings
	fastify.get("/api/settings", async () => {
		const { getSettings } = await loadModule<typeof import("./src/lib/db")>(
			"./src/lib/db",
		);
		return getSettings();
	});

	fastify.post("/api/settings", async (request: FastifyRequest, reply: FastifyReply) => {
		const { saveSettings } = await loadModule<typeof import("./src/lib/db")>(
			"./src/lib/db",
		);
		const input = request.body as {
			nodeUrl: string;
			dalNodeUrl?: string;
			bakerAddress: string;
			bakerAlias?: string;
		};

		if (!input || !input.nodeUrl || !input.bakerAddress) {
			return reply
				.status(400)
				.send({ error: "nodeUrl and bakerAddress are required" });
		}

		return saveSettings({
			nodeUrl: input.nodeUrl,
			dalNodeUrl: input.dalNodeUrl,
			bakerAddress: input.bakerAddress,
			bakerAlias: input.bakerAlias,
		});
	});

	// Baker routes
	fastify.get("/api/baker/status", async (_request: FastifyRequest, reply: FastifyReply) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getBakerStatus } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return reply.status(503).send({ error: "Not configured" });
		}

		try {
			return await getBakerStatus();
		} catch (error) {
			fastify.log.error("Failed to get baker status:", error);
			return reply.status(502).send({
				error:
					error instanceof Error ? error.message : "Failed to fetch baker status",
			});
		}
	});

	fastify.get("/api/baker/participation", async (_request: FastifyRequest, reply: FastifyReply) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getBakerParticipation } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return reply.status(503).send({ error: "Not configured" });
		}

		try {
			return await getBakerParticipation();
		} catch (error) {
			fastify.log.error("Failed to get baker participation:", error);
			return reply.status(502).send({
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch baker participation",
			});
		}
	});

	fastify.get("/api/baker/rewards", async (request: FastifyRequest, reply: FastifyReply) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getRewardsHistory } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return reply.status(503).send({ error: "Not configured" });
		}

		const query = request.query as { cycles?: string };
		const cycles = Number.parseInt(query.cycles || "10", 10);

		try {
			return await getRewardsHistory(cycles);
		} catch (error) {
			fastify.log.error("Failed to get rewards history:", error);
			return reply.status(502).send({
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch rewards history",
			});
		}
	});

	fastify.get("/api/baker/domain", async () => {
		const { getSettings } = await loadModule<typeof import("./src/lib/db")>(
			"./src/lib/db",
		);
		const settings = getSettings();

		if (!settings) {
			return { domain: null, address: "" };
		}

		const bakerAddress = settings.bakerAddress;

		try {
			const query = `
				query GetReverseRecord($address: String!) {
					reverseRecord(address: $address) {
						address
						domain {
							name
						}
					}
				}
			`;

			const response = await fetch("https://api.tezos.domains/graphql", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, variables: { address: bakerAddress } }),
			});

			if (!response.ok) {
				return { domain: null, address: bakerAddress };
			}

			const result = (await response.json()) as {
				data?: {
					reverseRecord?: { domain?: { name: string } | null } | null;
				};
			};

			return {
				domain: result.data?.reverseRecord?.domain?.name ?? null,
				address: bakerAddress,
			};
		} catch {
			return { domain: null, address: bakerAddress };
		}
	});

	// Rights routes
	fastify.get("/api/baker/rights/baking", async (_request: FastifyRequest, reply: FastifyReply) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getBakingRights } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return reply.status(503).send({ error: "Not configured" });
		}

		try {
			return await getBakingRights();
		} catch (error) {
			fastify.log.error("Failed to get baking rights:", error);
			return reply.status(502).send({
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch baking rights",
			});
		}
	});

	fastify.get("/api/baker/rights/attestation", async (_request: FastifyRequest, reply: FastifyReply) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getAttestationRights } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return reply.status(503).send({ error: "Not configured" });
		}

		try {
			return await getAttestationRights();
		} catch (error) {
			fastify.log.error("Failed to get attestation rights:", error);
			return reply.status(502).send({
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch attestation rights",
			});
		}
	});

	// Node routes
	fastify.get("/api/node/health", async (_request: FastifyRequest, reply: FastifyReply) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getNodeHealth } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return reply.status(503).send({ error: "Not configured" });
		}

		try {
			return await getNodeHealth();
		} catch (error) {
			fastify.log.error("Failed to get node health:", error);
			return reply.status(502).send({
				error:
					error instanceof Error ? error.message : "Failed to fetch node health",
			});
		}
	});

	// DAL routes
	fastify.get("/api/dal/status", async (_request: FastifyRequest, reply: FastifyReply) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getDalStatus } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return reply.status(503).send({ error: "Not configured" });
		}

		try {
			return await getDalStatus();
		} catch (error) {
			fastify.log.error("Failed to get DAL status:", error);
			return reply.status(502).send({
				error:
					error instanceof Error ? error.message : "Failed to fetch DAL status",
			});
		}
	});

	// Network routes
	fastify.get("/api/network/stats", async (_request: FastifyRequest, reply: FastifyReply) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getNetworkStats } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return reply.status(503).send({ error: "Not configured" });
		}

		try {
			return await getNetworkStats();
		} catch (error) {
			fastify.log.error("Failed to get network stats:", error);
			return reply.status(502).send({
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch network stats",
			});
		}
	});

	// Alerts
	fastify.get("/api/alerts", async () => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);
		const { getAlerts } = await loadModule<
			typeof import("./src/lib/api/octez")
		>("./src/lib/api/octez");

		if (!config.isConfigured) {
			return { alerts: [], unreadCount: 0 };
		}

		try {
			return await getAlerts();
		} catch (error) {
			fastify.log.error("Failed to get alerts:", error);
			return { alerts: [], unreadCount: 0 };
		}
	});

	// WebSocket for block stream
	fastify.get("/api/ws/blocks", { websocket: true }, async (socket: WebSocket) => {
		const { config } = await loadModule<typeof import("./src/lib/api/config")>(
			"./src/lib/api/config",
		);

		const nodeUrl = config.nodeUrl;
		if (!nodeUrl) {
			socket.close(1008, "No node URL configured");
			return;
		}

		let cachedBlocksPerCycle: number | null = null;
		let abortController: AbortController | null = null;
		let lastBlockLevel: number | null = null;

		async function getBlocksPerCycle(): Promise<number> {
			if (cachedBlocksPerCycle !== null) return cachedBlocksPerCycle;

			const response = await fetch(
				`${nodeUrl}/chains/main/blocks/head/context/constants`,
			);
			if (!response.ok) throw new Error(`Failed to fetch constants`);
			const constants = (await response.json()) as { blocks_per_cycle: number };
			cachedBlocksPerCycle = constants.blocks_per_cycle;
			return cachedBlocksPerCycle;
		}

		async function getCycleInfo(level: number) {
			const blocksPerCycle = await getBlocksPerCycle();
			return {
				currentCycle: Math.floor(level / blocksPerCycle),
				cyclePosition: level % blocksPerCycle,
				blocksPerCycle,
			};
		}

		async function connectToTezosStream() {
			abortController = new AbortController();
			const url = `${nodeUrl}/monitor/heads/main`;

			try {
				const response = await fetch(url, { signal: abortController.signal });
				if (!response.ok) throw new Error(`Failed to connect: ${response.status}`);

				const reader = response.body?.getReader();
				if (!reader) throw new Error("No response body");

				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed) continue;

						try {
							const block = JSON.parse(trimmed) as {
								level: number;
								hash: string;
								timestamp: string;
							};

							if (lastBlockLevel === block.level) continue;
							lastBlockLevel = block.level;

							const cycleInfo = await getCycleInfo(block.level);
							const message = JSON.stringify({
								type: "block",
								block: {
									level: block.level,
									hash: block.hash,
									timestamp: block.timestamp,
								},
								cycle: cycleInfo,
								serverTime: new Date().toISOString(),
							});

							socket.send(message);
						} catch {
							// Ignore parse errors
						}
					}
				}
			} catch (err) {
				if ((err as Error).name !== "AbortError") {
					fastify.log.error("Tezos stream error:", err);
				}
			}
		}

		// Start streaming
		connectToTezosStream();

		// Handle close
		socket.on("close", () => {
			abortController?.abort();
		});
	});
}

// Development or Production setup
let viteDevServer: Awaited<ReturnType<typeof import("vite").createServer>> | undefined;

if (DEVELOPMENT) {
	viteDevServer = await import("vite").then((vite) =>
		vite.createServer({
			server: { middlewareMode: true },
		}),
	);
}

// Register API routes FIRST
await registerApiRoutes(fastify, viteDevServer);

// Static files for production
if (!DEVELOPMENT) {
	await fastify.register(fastifyStatic, {
		root: path.join(__dirname, "dist/client"),
		prefix: "/",
		decorateReply: false,
	});
}

// Helper to run Vite middleware as a promise
function runViteMiddleware(
	vite: Awaited<ReturnType<typeof import("vite").createServer>>,
	req: import("node:http").IncomingMessage,
	res: import("node:http").ServerResponse,
): Promise<boolean> {
	return new Promise((resolve) => {
		// Vite middleware calls next() if it doesn't handle the request
		vite.middlewares(req, res, () => resolve(false));
		// If response ends, it was handled
		res.on("finish", () => resolve(true));
	});
}

// Catch-all for TanStack Start SSR (non-API routes)
fastify.all("/*", async (request, reply) => {
	// Skip API routes (already handled by explicit routes)
	if (request.url.startsWith("/api/")) {
		return reply.status(404).send({ error: "Not found" });
	}

	try {
		if (DEVELOPMENT && viteDevServer) {
			// First, let Vite handle static assets, HMR, etc.
			const viteHandled = await runViteMiddleware(
				viteDevServer,
				request.raw,
				reply.raw,
			);
			if (viteHandled || reply.sent) {
				return;
			}

			// Vite didn't handle it, so do SSR
			const { default: serverEntry } =
				await viteDevServer.ssrLoadModule("./src/server.ts");
			const handler = toNodeHandler(serverEntry.fetch) as NodeHttp1Handler;
			await handler(request.raw, reply.raw);
		} else {
			// @ts-expect-error - dist/server/server.js is built at build time
			const { default: handler } = await import("./dist/server/server.js");
			const nodeHandler = toNodeHandler(handler.fetch) as NodeHttp1Handler;
			await nodeHandler(request.raw, reply.raw);
		}
	} catch (error) {
		if (DEVELOPMENT && viteDevServer && error instanceof Error) {
			viteDevServer.ssrFixStacktrace(error);
		}
		fastify.log.error(error);
		if (!reply.sent) {
			reply.status(500).send("Internal Server Error");
		}
	}
});

try {
	await fastify.listen({ port: PORT, host: "0.0.0.0" });
	console.log(`Server is running on http://localhost:${PORT}`);
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
