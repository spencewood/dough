import type { Alert, AlertsResponse } from "@/lib/types";

/** Mock alerts for development */
export const mockAlerts: Alert[] = [
	{
		id: "alert-1",
		type: "missed_attestation",
		severity: "warning",
		message: "Missed attestation at level 5,432,100",
		timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
		level: 5432100,
	},
	{
		id: "alert-2",
		type: "low_balance",
		severity: "warning",
		message: "Baker balance below recommended threshold",
		timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
	},
	{
		id: "alert-3",
		type: "node_behind",
		severity: "info",
		message: "Node was 3 blocks behind, now synced",
		timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
	},
];

/** Mock alerts response */
export const mockAlertsResponse: AlertsResponse = {
	alerts: mockAlerts,
	unreadCount: 2,
};
