import { useQuery } from "@tanstack/react-query";
import type { AlertsResponse } from "@/lib/types";

async function fetchAlerts(): Promise<AlertsResponse> {
	const response = await fetch("/api/alerts");
	if (!response.ok) {
		throw new Error("Failed to fetch alerts");
	}
	return response.json();
}

export function useAlerts() {
	return useQuery({
		queryKey: ["alerts"],
		queryFn: fetchAlerts,
		refetchInterval: 30_000, // Poll every 30 seconds
	});
}
