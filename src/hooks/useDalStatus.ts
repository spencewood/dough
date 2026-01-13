import { useQuery } from "@tanstack/react-query";
import type { DALNodeStatus } from "@/lib/types";

async function fetchDalStatus(): Promise<DALNodeStatus> {
	const response = await fetch("/api/dal/status");
	if (!response.ok) {
		throw new Error("Failed to fetch DAL status");
	}
	return response.json();
}

export function useDalStatus() {
	return useQuery({
		queryKey: ["dal", "status"],
		queryFn: fetchDalStatus,
		refetchInterval: 30_000, // Poll every 30 seconds
	});
}
