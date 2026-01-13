import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Settings, SettingsInput } from "@/lib/db";

async function fetchSettings(): Promise<Settings | null> {
	const response = await fetch("/api/settings");
	if (!response.ok) {
		throw new Error("Failed to fetch settings");
	}
	return response.json();
}

async function saveSettingsApi(input: SettingsInput): Promise<Settings> {
	const response = await fetch("/api/settings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!response.ok) {
		throw new Error("Failed to save settings");
	}
	return response.json();
}

export function useSettings() {
	return useQuery({
		queryKey: ["settings"],
		queryFn: fetchSettings,
		staleTime: 60_000, // Settings don't change often
	});
}

export function useSaveSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: saveSettingsApi,
		onSuccess: (data) => {
			queryClient.setQueryData(["settings"], data);
			// Invalidate all queries since settings affect everything
			queryClient.invalidateQueries();
		},
	});
}
