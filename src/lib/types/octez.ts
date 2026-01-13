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
