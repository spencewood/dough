import { HttpResponse, http } from "msw";
import { mockDalConnections, mockDalProfile, mockDalStatus } from "../data";

const DAL_NODE_URL = "http://localhost:10732";

export const dalHandlers = [
	// GET /p2p/gossipsub/connections
	http.get(`${DAL_NODE_URL}/p2p/gossipsub/connections`, () => {
		return HttpResponse.json(mockDalConnections);
	}),

	// GET /profiles
	http.get(`${DAL_NODE_URL}/profiles`, () => {
		return HttpResponse.json(mockDalProfile);
	}),

	// API route for our dashboard - DAL status
	http.get("/api/dal/status", () => {
		return HttpResponse.json(mockDalStatus);
	}),
];
