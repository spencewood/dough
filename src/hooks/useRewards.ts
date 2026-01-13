import { useQuery } from "@tanstack/react-query";
import type { RewardsHistory } from "@/lib/types";

async function fetchRewards(): Promise<RewardsHistory> {
	const response = await fetch("/api/baker/rewards");
	if (!response.ok) {
		throw new Error("Failed to fetch rewards history");
	}
	return response.json();
}

export function useRewards() {
	return useQuery({
		queryKey: ["baker", "rewards"],
		queryFn: fetchRewards,
		refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes (rewards don't change often)
	});
}
