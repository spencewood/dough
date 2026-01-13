import { useQuery } from "@tanstack/react-query";
import type { BakerParticipation } from "@/lib/types";

async function fetchBakerParticipation(): Promise<BakerParticipation> {
	const response = await fetch("/api/baker/participation");
	if (!response.ok) {
		throw new Error("Failed to fetch baker participation");
	}
	return response.json();
}

export function useBakerParticipation() {
	return useQuery({
		queryKey: ["baker", "participation"],
		queryFn: fetchBakerParticipation,
		refetchInterval: 30_000, // Refresh every 30 seconds
	});
}
