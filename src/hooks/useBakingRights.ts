import { useQuery } from "@tanstack/react-query";
import type { BakingRight } from "@/lib/types";

async function fetchBakingRights(): Promise<BakingRight[]> {
	const response = await fetch("/api/baker/rights/baking");
	if (!response.ok) {
		throw new Error("Failed to fetch baking rights");
	}
	return response.json();
}

export function useBakingRights() {
	return useQuery({
		queryKey: ["baker", "rights", "baking"],
		queryFn: fetchBakingRights,
		refetchInterval: 60_000, // Poll every minute
	});
}
