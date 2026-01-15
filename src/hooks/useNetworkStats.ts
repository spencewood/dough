import { useQuery } from "@tanstack/react-query";
import type { NetworkStats } from "@/lib/types";

async function fetchNetworkStats(): Promise<NetworkStats> {
	const response = await fetch("/api/network/stats");
	if (!response.ok) {
		throw new Error("Failed to fetch network stats");
	}
	return response.json();
}

export function useNetworkStats() {
	return useQuery({
		queryKey: ["network", "stats"],
		queryFn: fetchNetworkStats,
		refetchInterval: 60_000, // Poll every 60s for protocol/chainId (block data comes via WebSocket)
	});
}
