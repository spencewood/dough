import { useQuery } from "@tanstack/react-query";

interface BakerDomainResponse {
	domain: string | null;
	address: string;
}

async function fetchBakerDomain(): Promise<BakerDomainResponse> {
	const response = await fetch("/api/baker/domain");
	if (!response.ok) {
		throw new Error("Failed to fetch baker domain");
	}
	return response.json();
}

export function useBakerDomain() {
	return useQuery({
		queryKey: ["baker", "domain"],
		queryFn: fetchBakerDomain,
		// Domain rarely changes, so refetch less frequently
		refetchInterval: 5 * 60 * 1000, // 5 minutes
		staleTime: 60 * 1000, // 1 minute
	});
}
