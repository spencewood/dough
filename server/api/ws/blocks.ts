import { defineWebSocketHandler } from "nitro/h3";
import { config } from "@/lib/api/config";
import type { BlockStreamMessage } from "@/lib/types";

// Track connected WebSocket peers
const peers = new Set<{
	send: (data: string) => void;
	close: () => void;
}>();

// Tezos stream connection state
let tezosStreamController: AbortController | null = null;
let lastBlockLevel: number | null = null;

/** Connect to Tezos /monitor/heads/main streaming endpoint */
async function connectToTezosStream() {
	if (tezosStreamController) {
		return; // Already connected
	}

	const nodeUrl = config.nodeUrl;
	if (!nodeUrl) {
		console.error("[WS] No node URL configured");
		return;
	}

	tezosStreamController = new AbortController();
	const url = `${nodeUrl}/monitor/heads/main`;

	console.log("[WS] Connecting to Tezos stream:", url);

	try {
		const response = await fetch(url, {
			signal: tezosStreamController.signal,
		});

		if (!response.ok) {
			throw new Error(`Failed to connect: ${response.status}`);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("No response body");
		}

		const decoder = new TextDecoder();
		let buffer = "";

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				console.log("[WS] Tezos stream ended");
				break;
			}

			// Decode chunk and add to buffer
			buffer += decoder.decode(value, { stream: true });

			// Process complete JSON lines
			const lines = buffer.split("\n");
			buffer = lines.pop() || ""; // Keep incomplete line in buffer

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;

				try {
					const block = JSON.parse(trimmed) as {
						level: number;
						hash: string;
						timestamp: string;
					};

					// Skip if we already processed this block
					if (lastBlockLevel === block.level) {
						continue;
					}
					lastBlockLevel = block.level;

					console.log("[WS] New block:", block.level);

					// Broadcast to all connected peers
					const message: BlockStreamMessage = {
						type: "block",
						block: {
							level: block.level,
							hash: block.hash,
							timestamp: block.timestamp,
						},
						serverTime: new Date().toISOString(),
					};

					const messageStr = JSON.stringify(message);
					for (const peer of peers) {
						try {
							peer.send(messageStr);
						} catch (err) {
							console.error("[WS] Failed to send to peer:", err);
						}
					}
				} catch (parseErr) {
					console.error("[WS] Failed to parse block:", parseErr, trimmed);
				}
			}
		}
	} catch (err) {
		if ((err as Error).name === "AbortError") {
			console.log("[WS] Tezos stream aborted");
		} else {
			console.error("[WS] Tezos stream error:", err);
		}
	} finally {
		tezosStreamController = null;
		lastBlockLevel = null;

		// Reconnect if there are still peers connected
		if (peers.size > 0) {
			console.log("[WS] Reconnecting to Tezos stream in 5s...");
			setTimeout(connectToTezosStream, 5000);
		}
	}
}

/** Disconnect from Tezos stream */
function disconnectFromTezosStream() {
	if (tezosStreamController) {
		console.log("[WS] Disconnecting from Tezos stream");
		tezosStreamController.abort();
		tezosStreamController = null;
	}
}

export default defineWebSocketHandler({
	open(peer) {
		console.log("[WS] Client connected");
		peers.add(peer);

		// Start Tezos stream if this is the first client
		if (peers.size === 1) {
			connectToTezosStream();
		}
	},

	message(_peer, message) {
		// We don't expect messages from clients, but log them
		console.log("[WS] Received message:", message);
	},

	close(peer) {
		console.log("[WS] Client disconnected");
		peers.delete(peer);

		// Stop Tezos stream if no more clients
		if (peers.size === 0) {
			disconnectFromTezosStream();
		}
	},

	error(peer, error) {
		console.error("[WS] Client error:", error);
		peers.delete(peer);

		if (peers.size === 0) {
			disconnectFromTezosStream();
		}
	},
});
