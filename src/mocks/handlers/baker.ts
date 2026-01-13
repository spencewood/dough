import { HttpResponse, http } from "msw";
import {
	MOCK_BAKER_ADDRESS,
	mockAttestationRights,
	mockBakerParticipation,
	mockBakerStatus,
	mockBakingRights,
	mockDelegateResponse,
	mockRewardsHistory,
} from "../data";

const OCTEZ_NODE_URL = "http://localhost:8732";

export const bakerHandlers = [
	// GET /chains/main/blocks/head/context/delegates/:pkh
	http.get(
		`${OCTEZ_NODE_URL}/chains/main/blocks/head/context/delegates/:pkh`,
		({ params }) => {
			const { pkh } = params;
			if (pkh === MOCK_BAKER_ADDRESS) {
				return HttpResponse.json(mockDelegateResponse);
			}
			return new HttpResponse(null, { status: 404 });
		},
	),

	// GET /chains/main/blocks/head/helpers/baking_rights
	http.get(
		`${OCTEZ_NODE_URL}/chains/main/blocks/head/helpers/baking_rights`,
		({ request }) => {
			const url = new URL(request.url);
			const delegate = url.searchParams.get("delegate");

			if (delegate === MOCK_BAKER_ADDRESS) {
				// Update estimated times relative to now
				const updatedRights = mockBakingRights.map((right, i) => ({
					...right,
					estimated_time: new Date(
						Date.now() + (i + 1) * 15 * 60 * 1000,
					).toISOString(),
				}));
				return HttpResponse.json(updatedRights);
			}
			return HttpResponse.json([]);
		},
	),

	// GET /chains/main/blocks/head/helpers/attestation_rights
	http.get(
		`${OCTEZ_NODE_URL}/chains/main/blocks/head/helpers/attestation_rights`,
		({ request }) => {
			const url = new URL(request.url);
			const delegate = url.searchParams.get("delegate");

			if (delegate === MOCK_BAKER_ADDRESS) {
				return HttpResponse.json(mockAttestationRights);
			}
			return HttpResponse.json([]);
		},
	),

	// API route for our dashboard - baker status
	http.get("/api/baker/status", () => {
		return HttpResponse.json(mockBakerStatus);
	}),

	// API route for our dashboard - baking rights
	http.get("/api/baker/rights/baking", () => {
		const updatedRights = mockBakingRights.map((right, i) => ({
			level: right.level,
			delegate: right.delegate,
			round: right.round,
			estimatedTime: new Date(
				Date.now() + (i + 1) * 15 * 60 * 1000,
			).toISOString(),
		}));
		return HttpResponse.json(updatedRights);
	}),

	// API route for our dashboard - attestation rights
	http.get("/api/baker/rights/attestation", () => {
		const flattenedRights = mockAttestationRights.flatMap((right) =>
			right.delegates.map((d) => ({
				level: right.level,
				delegate: d.delegate,
				firstSlot: d.first_slot,
				attestationPower: d.attestation_power,
			})),
		);
		return HttpResponse.json(flattenedRights);
	}),

	// API route for our dashboard - rewards history
	http.get("/api/baker/rewards", () => {
		return HttpResponse.json(mockRewardsHistory);
	}),

	// API route for our dashboard - participation stats
	http.get("/api/baker/participation", () => {
		return HttpResponse.json(mockBakerParticipation);
	}),
];
