import { useCallback, useEffect, useRef, useState } from "react";
import type {
	BlockInfo,
	BlockStreamMessage,
	BlockStreamState,
	CycleInfo,
} from "@/lib/types";

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

/**
 * Hook for real-time block stream via WebSocket.
 * Calculates accurate time since block and clock drift.
 */
export function useBlockStream(): BlockStreamState & {
	isNewBlock: boolean;
} {
	const [latestBlock, setLatestBlock] = useState<BlockInfo | null>(null);
	const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
	const [serverDriftMs, setServerDriftMs] = useState<number | null>(null);
	const [browserDriftMs, setBrowserDriftMs] = useState<number | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [secondsSinceBlock, setSecondsSinceBlock] = useState(0);
	const [isNewBlock, setIsNewBlock] = useState(false);

	const wsRef = useRef<WebSocket | null>(null);
	const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const blockTimestampRef = useRef<number | null>(null);
	const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const connect = useCallback(() => {
		// Don't connect if we already have an active connection
		if (
			wsRef.current?.readyState === WebSocket.OPEN ||
			wsRef.current?.readyState === WebSocket.CONNECTING
		) {
			return;
		}

		// Determine WebSocket URL based on current location
		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = `${protocol}//${window.location.host}/api/ws/blocks`;

		console.log("[useBlockStream] Connecting to", wsUrl);
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log("[useBlockStream] Connected");
			setIsConnected(true);
			reconnectDelayRef.current = INITIAL_RECONNECT_DELAY; // Reset backoff
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as BlockStreamMessage;

				if (message.type === "block") {
					const blockTime = new Date(message.block.timestamp).getTime();
					const serverTime = new Date(message.serverTime).getTime();
					const browserTime = Date.now();

					// Store block timestamp for timer calculations
					blockTimestampRef.current = blockTime;

					// Calculate drift values (positive = clock is ahead of Tezos)
					setServerDriftMs(serverTime - blockTime);
					setBrowserDriftMs(browserTime - blockTime);

					// Update latest block and cycle info
					setLatestBlock(message.block);
					setCycleInfo(message.cycle);

					// Calculate initial seconds since block
					const initialSeconds = Math.floor((browserTime - blockTime) / 1000);
					setSecondsSinceBlock(Math.max(0, initialSeconds));

					// Trigger new block animation
					setIsNewBlock(true);
					setTimeout(() => setIsNewBlock(false), 500);

					console.log(
						"[useBlockStream] Block",
						message.block.level,
						"cycle",
						message.cycle.currentCycle,
						"pos",
						message.cycle.cyclePosition,
						"age:",
						initialSeconds,
						"s",
					);
				}
			} catch (err) {
				console.error("[useBlockStream] Failed to parse message:", err);
			}
		};

		ws.onclose = (event) => {
			console.log("[useBlockStream] Disconnected", event.code, event.reason);
			setIsConnected(false);
			wsRef.current = null;

			// Schedule reconnect with exponential backoff
			const delay = reconnectDelayRef.current;
			reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);

			console.log("[useBlockStream] Reconnecting in", delay, "ms");
			reconnectTimeoutRef.current = setTimeout(connect, delay);
		};

		ws.onerror = (error) => {
			console.error("[useBlockStream] WebSocket error:", error);
		};

		wsRef.current = ws;
	}, []);

	// Connect on mount
	useEffect(() => {
		connect();

		return () => {
			// Cleanup on unmount
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
		};
	}, [connect]);

	// Timer to update seconds since block
	useEffect(() => {
		// Clear any existing interval
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
		}

		const updateTimer = () => {
			if (blockTimestampRef.current) {
				const now = Date.now();
				const diffSeconds = Math.floor(
					(now - blockTimestampRef.current) / 1000,
				);
				setSecondsSinceBlock(Math.max(0, diffSeconds));
			}
		};

		// Update immediately and then every second
		updateTimer();
		timerIntervalRef.current = setInterval(updateTimer, 1000);

		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}
		};
	}, []);

	return {
		latestBlock,
		cycleInfo,
		serverDriftMs,
		browserDriftMs,
		isConnected,
		secondsSinceBlock,
		isNewBlock,
	};
}
