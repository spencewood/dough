import { HttpResponse, http } from "msw";
import { mockAlertsResponse } from "../data";

export const alertsHandlers = [
	// API route for our dashboard - alerts
	http.get("/api/alerts", () => {
		return HttpResponse.json(mockAlertsResponse);
	}),
];
