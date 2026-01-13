import { useQuery } from "@tanstack/react-query";
import type { AttestationRight } from "@/lib/types";

async function fetchAttestationRights(): Promise<AttestationRight[]> {
	const response = await fetch("/api/baker/rights/attestation");
	if (!response.ok) {
		throw new Error("Failed to fetch attestation rights");
	}
	return response.json();
}

export function useAttestationRights() {
	return useQuery({
		queryKey: ["baker", "rights", "attestation"],
		queryFn: fetchAttestationRights,
		refetchInterval: 60_000, // Poll every minute
	});
}
