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
		nodeRpc<{ validated: Array<unknown>; applied?: Array<unknown> }>(
			"/chains/main/mempool/pending_operations",
		),
	]);

	// mempool uses "validated" in newer protocols, "applied" in older ones
	const mempoolOps = pendingOps.validated || pendingOps.applied || [];

	return {
		isBootstrapped: bootstrapped.bootstrapped,
		syncState: bootstrapped.sync_state as "synced" | "syncing" | "stale",
		headLevel: header.level,
		headHash: header.hash,
		headTimestamp: header.timestamp,
		protocol: header.protocol,
		chainId: header.chain_id,
		peerCount: connections.length,
		mempoolSize: mempoolOps.length,
	};
}

/** Get baker/delegate status */
export async function getBakerStatus(): Promise<BakerStatus> {
	const address = config.bakerAddress;
	if (!address) {
		throw new Error("BAKER_ADDRESS not configured");
	}

	// Newer protocol (Seoulo+) uses different field names
	const delegate = await nodeRpc<{
		// New field names (Seoulo+)
		own_full_balance?: string;
		total_staked?: string;
		total_delegated?: string;
		delegators?: string[];
		// Legacy field names (pre-Seoulo)
		full_balance?: string;
		current_frozen_deposits?: string;
		staking_balance?: string;
		delegated_balance?: string;
		delegated_contracts?: string[];
		// Common fields
		deactivated: boolean;
		grace_period: number;
	}>(`/chains/main/blocks/head/context/delegates/${address}`);

	// Support both old and new field names
	const fullBalance =
		delegate.own_full_balance || delegate.full_balance || "0";
	const frozenDeposits =
		delegate.total_staked || delegate.current_frozen_deposits || "0";
	const stakingBalance =
		delegate.total_staked || delegate.staking_balance || "0";
	const delegatedBalance =
		delegate.total_delegated || delegate.delegated_balance || "0";
	const delegatorCount =
		delegate.delegators?.length || delegate.delegated_contracts?.length || 0;

	// Calculate staking capacity
	const stakingBalanceNum = Number(stakingBalance);
	const fullBalanceNum = Number(fullBalance);
	const stakingCapacity = fullBalanceNum * 9; // 9x over-staking limit
	const stakingCapacityUsed =
		stakingCapacity > 0 ? (stakingBalanceNum / stakingCapacity) * 100 : 0;

	return {
		address,
		alias: config.bakerAlias,
		fullBalance,
		frozenDeposits,
		stakingBalance,
		delegatedBalance,
		delegatorCount,
		gracePeriod: delegate.grace_period,
		isDeactivated: delegate.deactivated,
		stakingCapacityUsed,
	};
}

/** Get upcoming baking rights */
export async function getBakingRights(
	maxRound = 1,
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
		`/chains/main/blocks/head/helpers/baking_rights?delegate=${address}&max_round=${maxRound}`,
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

/** TzKT reward response for a cycle (newer API format) */
interface TzKTRewardResponse {
	cycle: number;
	// Staking fields
	ownStakedBalance: number;
	externalStakedBalance: number;
	ownDelegatedBalance: number;
	externalDelegatedBalance: number;
	delegatorsCount: number;
	// Block rewards (split by reward recipient type)
	blockRewardsDelegated: number;
	blockRewardsStakedOwn: number;
	blockRewardsStakedEdge: number;
	blockRewardsStakedShared: number;
	missedBlockRewards: number;
	// Attestation rewards (split by reward recipient type)
	attestationRewardsDelegated: number;
	attestationRewardsStakedOwn: number;
	attestationRewardsStakedEdge: number;
	attestationRewardsStakedShared: number;
	missedAttestationRewards: number;
	// Endorsement rewards (older name, kept for compatibility)
	endorsementRewardsDelegated?: number;
	endorsementRewardsStakedOwn?: number;
	endorsementRewardsStakedEdge?: number;
	endorsementRewardsStakedShared?: number;
	missedEndorsementRewards?: number;
}

/** Get rewards history from TzKT API */
export async function getRewardsHistory(
	numCycles = 10,
): Promise<import("@/lib/types").RewardsHistory> {
	const address = config.bakerAddress;
	if (!address) {
		throw new Error("BAKER_ADDRESS not configured");
	}

	const tzktUrl = config.tzktApiUrl;

	// Fetch rewards from TzKT
	const response = await fetchRpc<TzKTRewardResponse[]>(
		tzktUrl,
		`/v1/rewards/bakers/${address}?limit=${numCycles}&sort.desc=cycle`,
	);

	const cycles = response.map((r) => {
		// Sum block rewards from all sources (values already in mutez)
		const blockRewards =
			(r.blockRewardsDelegated || 0) +
			(r.blockRewardsStakedOwn || 0) +
			(r.blockRewardsStakedEdge || 0) +
			(r.blockRewardsStakedShared || 0);

		// Sum attestation rewards (use attestation or endorsement fields)
		const attestationRewards =
			(r.attestationRewardsDelegated || r.endorsementRewardsDelegated || 0) +
			(r.attestationRewardsStakedOwn || r.endorsementRewardsStakedOwn || 0) +
			(r.attestationRewardsStakedEdge || r.endorsementRewardsStakedEdge || 0) +
			(r.attestationRewardsStakedShared ||
				r.endorsementRewardsStakedShared ||
				0);

		const missedAttestation =
			r.missedAttestationRewards || r.missedEndorsementRewards || 0;

		return {
			cycle: r.cycle,
			bakingRewards: blockRewards.toString(),
			attestationRewards: attestationRewards.toString(),
			totalRewards: (blockRewards + attestationRewards).toString(),
			missedBakingRewards: (r.missedBlockRewards || 0).toString(),
			missedAttestationRewards: missedAttestation.toString(),
			ownStakingBalance: (r.ownStakedBalance || 0).toString(),
			externalStakingBalance: (
				(r.externalStakedBalance || 0) + (r.externalDelegatedBalance || 0)
			).toString(),
		};
	});

	const totalEarned = cycles
		.reduce((sum, c) => sum + BigInt(c.totalRewards), BigInt(0))
		.toString();
	const totalMissed = cycles
		.reduce(
			(sum, c) =>
				sum +
				BigInt(c.missedBakingRewards) +
				BigInt(c.missedAttestationRewards),
			BigInt(0),
		)
		.toString();

	return {
		delegate: address,
		cycles,
		totalEarned,
		totalMissed,
	};
}

/** Generate alerts based on current node and baker status */
export async function getAlerts(): Promise<
	import("@/lib/types").AlertsResponse
> {
	const alerts: import("@/lib/types").Alert[] = [];
	const now = new Date().toISOString();

	try {
		// Check node health
		const nodeHealth = await getNodeHealth().catch(() => null);

		if (!nodeHealth) {
			alerts.push({
				id: `node-unreachable-${Date.now()}`,
				type: "node_behind",
				severity: "error",
				message: "Cannot connect to Octez node",
				timestamp: now,
			});
		} else {
			// Check sync state
			if (nodeHealth.syncState === "stale") {
				alerts.push({
					id: `node-stale-${Date.now()}`,
					type: "node_behind",
					severity: "error",
					message: `Node is stale at level ${nodeHealth.headLevel.toLocaleString()}`,
					timestamp: now,
					level: nodeHealth.headLevel,
				});
			} else if (nodeHealth.syncState === "syncing") {
				alerts.push({
					id: `node-syncing-${Date.now()}`,
					type: "node_behind",
					severity: "warning",
					message: "Node is still syncing",
					timestamp: now,
					level: nodeHealth.headLevel,
				});
			}

			// Check if node is behind (head timestamp more than 5 minutes old)
			const headTime = new Date(nodeHealth.headTimestamp).getTime();
			const timeDiff = Date.now() - headTime;
			if (timeDiff > 5 * 60 * 1000 && nodeHealth.syncState === "synced") {
				alerts.push({
					id: `node-behind-${Date.now()}`,
					type: "node_behind",
					severity: "warning",
					message: `Node head is ${Math.floor(timeDiff / 60000)} minutes behind`,
					timestamp: now,
					level: nodeHealth.headLevel,
				});
			}
		}

		// Check baker status
		const bakerStatus = await getBakerStatus().catch(() => null);

		if (bakerStatus) {
			// Check if deactivated
			if (bakerStatus.isDeactivated) {
				alerts.push({
					id: `baker-deactivated-${Date.now()}`,
					type: "deactivation_warning",
					severity: "error",
					message: "Baker is deactivated! Register to resume baking.",
					timestamp: now,
				});
			}

			// Check grace period warning (if within 2 cycles of deactivation)
			if (!bakerStatus.isDeactivated && bakerStatus.gracePeriod <= 2) {
				alerts.push({
					id: `grace-period-warning-${Date.now()}`,
					type: "deactivation_warning",
					severity: "warning",
					message: `Baker will be deactivated in ${bakerStatus.gracePeriod} cycle(s) if no baking occurs`,
					timestamp: now,
				});
			}

			// Check low balance (less than 6000 XTZ recommended minimum)
			const balance = Number(bakerStatus.fullBalance) / 1_000_000;
			if (balance < 6000) {
				alerts.push({
					id: `low-balance-${Date.now()}`,
					type: "low_balance",
					severity: balance < 1000 ? "error" : "warning",
					message: `Low baker balance: ${balance.toLocaleString()} XTZ`,
					timestamp: now,
				});
			}

			// Check overstaking (capacity > 90%)
			if (bakerStatus.stakingCapacityUsed > 90) {
				alerts.push({
					id: `overstaking-warning-${Date.now()}`,
					type: "low_balance",
					severity: bakerStatus.stakingCapacityUsed > 100 ? "error" : "warning",
					message: `Staking capacity at ${bakerStatus.stakingCapacityUsed.toFixed(1)}%`,
					timestamp: now,
				});
			}
		}

		// Check DAL status
		const dalStatus = await getDalStatus().catch(() => null);

		if (dalStatus && !dalStatus.isConnected && config.dalNodeUrl) {
			alerts.push({
				id: `dal-disconnected-${Date.now()}`,
				type: "dal_disconnected",
				severity: "warning",
				message: "DAL node is not connected",
				timestamp: now,
			});
		}
	} catch (error) {
		console.error("Error generating alerts:", error);
	}

	return {
		alerts,
		unreadCount: alerts.filter((a) => a.severity === "error").length,
	};
}
