import { HttpResponse, http } from "msw";
import {
	mockBlockHeader,
	mockNetworkConnections,
	mockNodeHealth,
	mockPendingOperations,
} from "../data";

const OCTEZ_NODE_URL = "http://localhost:8732";

export const nodeHandlers = [
	// GET /chains/main/blocks/head
	http.get(`${OCTEZ_NODE_URL}/chains/main/blocks/head`, () => {
		return HttpResponse.json({
			...mockBlockHeader,
			// Update timestamp to current time for realism
			timestamp: new Date().toISOString(),
		});
	}),

	// GET /chains/main/blocks/head/header
	http.get(`${OCTEZ_NODE_URL}/chains/main/blocks/head/header`, () => {
		return HttpResponse.json({
			...mockBlockHeader,
			timestamp: new Date().toISOString(),
		});
	}),

	// GET /network/connections
	http.get(`${OCTEZ_NODE_URL}/network/connections`, () => {
		return HttpResponse.json(mockNetworkConnections);
	}),

	// GET /network/stat
	http.get(`${OCTEZ_NODE_URL}/network/stat`, () => {
		return HttpResponse.json({
			total_sent: "1234567890",
			total_recv: "9876543210",
			current_inflow: 1024,
			current_outflow: 2048,
		});
	}),

	// GET /chains/main/mempool/pending_operations
	http.get(`${OCTEZ_NODE_URL}/chains/main/mempool/pending_operations`, () => {
		return HttpResponse.json(mockPendingOperations);
	}),

	// GET /monitor/bootstrapped (SSE endpoint - return simple JSON for mock)
	http.get(`${OCTEZ_NODE_URL}/monitor/bootstrapped`, () => {
		return HttpResponse.json({
			block: mockBlockHeader.hash,
			timestamp: new Date().toISOString(),
			sync_state: "synced",
		});
	}),

	// GET /version
	http.get(`${OCTEZ_NODE_URL}/version`, () => {
		return HttpResponse.json({
			version: {
				major: 20,
				minor: 3,
				additional_info: "release",
			},
			network_version: {
				chain_name: "TEZOS_MAINNET",
				distributed_db_version: 2,
				p2p_version: 1,
			},
			commit_info: {
				commit_hash: "abc123def456",
				commit_date: "2025-01-01T00:00:00Z",
			},
		});
	}),

	// API route for our dashboard
	http.get("/api/node/health", () => {
		return HttpResponse.json({
			...mockNodeHealth,
			headTimestamp: new Date().toISOString(),
		});
	}),
];
