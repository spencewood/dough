import type {
	AttestationRight,
	BakerStatus,
	BakingRight,
	NodeHealth,
} from "@/lib/types";
import { config } from "./config";

/** Fetch wrapper with timeout and error handling */
async function fetchRpc<T>(
	baseUrl: string,
	path: string,
	options?: RequestInit,
): Promise<T> {
	const url = `${baseUrl}${path}`;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});

		if (!response.ok) {
			throw new Error(`RPC error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	} finally {
		clearTimeout(timeout);
	}
}

/** Fetch from Octez node */
function nodeRpc<T>(path: string): Promise<T> {
	return fetchRpc<T>(config.nodeUrl, path);
}

/** Fetch from DAL node */
function dalRpc<T>(path: string): Promise<T> {
	return fetchRpc<T>(config.dalNodeUrl, path);
}

/** Get node health and sync status */
export async function getNodeHealth(): Promise<NodeHealth> {
	const [bootstrapped, header, connections, pendingOps] = await Promise.all([
		nodeRpc<{ bootstrapped: boolean; sync_state: string }>(
			"/chains/main/is_bootstrapped",
		),
		nodeRpc<{
			level: number;
			hash: string;
			timestamp: string;
			protocol: string;
			chain_id: string;
		}>("/chains/main/blocks/head/header"),
		nodeRpc<Array<unknown>>("/network/connections"),
		nodeRpc<{ applied: Array<unknown> }>(
			"/chains/main/mempool/pending_operations",
		),
	]);

	return {
		isBootstrapped: bootstrapped.bootstrapped,
		syncState: bootstrapped.sync_state as "synced" | "syncing" | "stale",
		headLevel: header.level,
		headHash: header.hash,
		headTimestamp: header.timestamp,
		protocol: header.protocol,
		chainId: header.chain_id,
		peerCount: connections.length,
		mempoolSize: pendingOps.applied.length,
	};
}

/** Get baker/delegate status */
export async function getBakerStatus(): Promise<BakerStatus> {
	const address = config.bakerAddress;
	if (!address) {
		throw new Error("BAKER_ADDRESS not configured");
	}

	const delegate = await nodeRpc<{
		full_balance: string;
		current_frozen_deposits: string;
		staking_balance: string;
		delegated_balance: string;
		deactivated: boolean;
		grace_period: number;
		delegated_contracts: string[];
	}>(`/chains/main/blocks/head/context/delegates/${address}`);

	// Calculate staking capacity
	const stakingBalance = Number(delegate.staking_balance);
	const fullBalance = Number(delegate.full_balance);
	const stakingCapacity = fullBalance * 9; // 9x over-staking limit
	const stakingCapacityUsed =
		stakingCapacity > 0 ? (stakingBalance / stakingCapacity) * 100 : 0;

	return {
		address,
		alias: config.bakerAlias,
		fullBalance: delegate.full_balance,
		frozenDeposits: delegate.current_frozen_deposits,
		stakingBalance: delegate.staking_balance,
		delegatedBalance: delegate.delegated_balance,
		delegatorCount: delegate.delegated_contracts.length,
		gracePeriod: delegate.grace_period,
		isDeactivated: delegate.deactivated,
		stakingCapacityUsed,
	};
}

/** Get upcoming baking rights */
export async function getBakingRights(
	maxPriority = 1,
	levels = 10,
): Promise<BakingRight[]> {
	const address = config.bakerAddress;
	if (!address) {
		return [];
	}

	const rights = await nodeRpc<
		Array<{
			level: number;
			delegate: string;
			round: number;
			estimated_time?: string;
		}>
	>(
		`/chains/main/blocks/head/helpers/baking_rights?delegate=${address}&max_round=${maxPriority}&cycle=head&max_priority=${levels}`,
	);

	return rights.map((r) => ({
		level: r.level,
		delegate: r.delegate,
		round: r.round,
		estimatedTime: r.estimated_time,
	}));
}

/** Get upcoming attestation rights */
export async function getAttestationRights(
	levels = 5,
): Promise<AttestationRight[]> {
	const address = config.bakerAddress;
	if (!address) {
		return [];
	}

	const rights = await nodeRpc<
		Array<{
			level: number;
			delegates: Array<{
				delegate: string;
				first_slot: number;
				attestation_power: number;
			}>;
		}>
	>(`/chains/main/blocks/head/helpers/attestation_rights?delegate=${address}`);

	// Flatten the nested structure
	return rights
		.flatMap((r) =>
			r.delegates.map((d) => ({
				level: r.level,
				delegate: d.delegate,
				firstSlot: d.first_slot,
				attestationPower: d.attestation_power,
			})),
		)
		.slice(0, levels);
}

/** Get DAL node status */
export async function getDalStatus() {
	try {
		const [version, peers, profiles] = await Promise.all([
			dalRpc<{ version: string }>("/version").catch(() => null),
			dalRpc<Array<unknown>>("/p2p/gossipsub/connections").catch(() => []),
			dalRpc<{ profiles: Array<{ slot: number }> }>(
				`/profiles/attester/pkh/${config.bakerAddress}`,
			).catch(() => ({ profiles: [] })),
		]);

		return {
			isConnected: version !== null,
			peerCount: peers.length,
			subscribedSlots: profiles.profiles.map((p) => p.slot),
		};
	} catch {
		return {
			isConnected: false,
			peerCount: 0,
			subscribedSlots: [],
		};
	}
}
