/**
 * Re-export Taquito RPC types and add our derived types
 */

// Re-export commonly used Taquito RPC types
export type {
	AttestationRightsQueryArguments,
	AttestationRightsResponse,
	BakingRightsQueryArguments,
	BakingRightsResponse,
	BlockHeaderResponse,
	BlockMetadata,
	BlockResponse,
	ConstantsResponse,
	DelegatesResponse,
	OperationHash,
	PendingOperationsV2,
} from "@taquito/rpc";

// =============================================================================
// Derived/Computed Types (used by our dashboard)
// =============================================================================

/** Computed node health status for display */
export interface NodeHealth {
	isBootstrapped: boolean;
	syncState: "synced" | "syncing" | "stale";
	headLevel: number;
	headHash: string;
	headTimestamp: string;
	protocol: string;
	chainId: string;
	peerCount: number;
	mempoolSize: number;
}

/** Computed baker status for display */
export interface BakerStatus {
	address: string;
	alias?: string;
	fullBalance: string;
	frozenDeposits: string;
	stakingBalance: string;
	delegatedBalance: string;
	delegatorCount: number;
	isDeactivated: boolean;
	gracePeriod: number;
	stakingCapacityUsed: number;
	hasPendingDenunciations: boolean;
}

/** Baker participation stats for current cycle */
export interface BakerParticipation {
	expectedCycleActivity: number;
	minimalCycleActivity: number;
	missedSlots: number;
	missedLevels: number;
	remainingAllowedMissedSlots: number;
	expectedAttestingRewards: string;
}

/** Network connection info (simplified from RPC) */
export interface NetworkPeer {
	peerId: string;
	address: string;
	port: number;
	incoming: boolean;
}

/** Flattened baking right for display */
export interface BakingRight {
	level: number;
	delegate: string;
	round: number;
	estimatedTime?: string;
}

/** Flattened attestation right for display */
export interface AttestationRight {
	level: number;
	delegate: string;
	firstSlot: number;
	attestationPower: number;
}

/** Rewards for a single cycle */
export interface CycleRewards {
	cycle: number;
	bakingRewards: string;
	attestationRewards: string;
	totalRewards: string;
	missedBakingRewards: string;
	missedAttestationRewards: string;
	ownStakingBalance: string;
	externalStakingBalance: string;
}

/** Summary of rewards history */
export interface RewardsHistory {
	delegate: string;
	cycles: CycleRewards[];
	totalEarned: string;
	totalMissed: string;
}

/** Alert severity levels */
export type AlertSeverity = "info" | "warning" | "error";

/** Alert type categories */
export type AlertType =
	| "missed_bake"
	| "missed_attestation"
	| "low_balance"
	| "deactivation_warning"
	| "node_behind"
	| "dal_disconnected";

/** Individual alert item */
export interface Alert {
	id: string;
	type: AlertType;
	severity: AlertSeverity;
	message: string;
	timestamp: string;
	level?: number;
	cycle?: number;
}

/** Alerts response */
export interface AlertsResponse {
	alerts: Alert[];
	unreadCount: number;
}

/** Network-wide statistics for ecosystem overview */
export interface NetworkStats {
	currentCycle: number;
	cyclePosition: number;
	blocksPerCycle: number;
	minimalBlockDelay: number;
	headLevel: number;
	headTimestamp: string;
	protocol: string;
	chainId: string;
}

/** Block info from WebSocket stream */
export interface BlockInfo {
	level: number;
	hash: string;
	timestamp: string;
}

/** WebSocket message for block stream */
export interface BlockStreamMessage {
	type: "block";
	block: BlockInfo;
	serverTime: string;
}

/** Block stream state for UI */
export interface BlockStreamState {
	latestBlock: BlockInfo | null;
	serverDriftMs: number | null;
	browserDriftMs: number | null;
	isConnected: boolean;
	secondsSinceBlock: number;
}
