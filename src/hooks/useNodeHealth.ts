import { useQuery } from "@tanstack/react-query";
import type { NodeHealth } from "@/lib/types";

async function fetchNodeHealth(): Promise<NodeHealth> {
	const response = await fetch("/api/node/health");
	if (!response.ok) {
		throw new Error("Failed to fetch node health");
	}
	return response.json();
}

export function useNodeHealth() {
	return useQuery({
		queryKey: ["node", "health"],
		queryFn: fetchNodeHealth,
		refetchInterval: 10_000, // Poll every 10 seconds
	});
}
