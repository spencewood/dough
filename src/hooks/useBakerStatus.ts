import { useQuery } from "@tanstack/react-query";
import type { BakerStatus } from "@/lib/types";

async function fetchBakerStatus(): Promise<BakerStatus> {
	const response = await fetch("/api/baker/status");
	if (!response.ok) {
		throw new Error("Failed to fetch baker status");
	}
	return response.json();
}

export function useBakerStatus() {
	return useQuery({
		queryKey: ["baker", "status"],
		queryFn: fetchBakerStatus,
		refetchInterval: 30_000, // Poll every 30 seconds
	});
}
