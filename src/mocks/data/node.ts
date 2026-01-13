import type { NodeHealth } from "@/lib/types";

/** Mock node health data for development */
export const mockNodeHealth: NodeHealth = {
	isBootstrapped: true,
	syncState: "synced",
	headLevel: 5_432_100,
	headHash: "BLockHashExampleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	headTimestamp: new Date().toISOString(),
	protocol: "PsQuebecnLByd3JwTiGadoG4nGWi3HYiLXUjkibeFV8dCFeVMUg",
	chainId: "NetXdQprcVkpaWU",
	peerCount: 42,
	mempoolSize: 15,
};

/** Mock block header response */
export const mockBlockHeader = {
	protocol: "PsQuebecnLByd3JwTiGadoG4nGWi3HYiLXUjkibeFV8dCFeVMUg",
	chain_id: "NetXdQprcVkpaWU",
	hash: "BLockHashExampleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	level: 5_432_100,
	proto: 19,
	predecessor: "BLockHashPredecessorXXXXXXXXXXXXXXXXXXXXXXXXXX",
	timestamp: new Date().toISOString(),
	validation_pass: 4,
	operations_hash: "LLoXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	fitness: ["02", "005318e4", "", "ffffffff", "00000000"],
	context: "CoVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	payload_hash: "vh2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	payload_round: 0,
	proof_of_work_nonce: "0000000000000000",
	liquidity_baking_toggle_vote: "pass" as const,
	adaptive_issuance_vote: "pass" as const,
};

/** Mock network connections */
export const mockNetworkConnections = Array.from({ length: 42 }, (_, i) => ({
	incoming: i % 3 === 0,
	peer_id: `peer-id-${i.toString().padStart(3, "0")}`,
	id_point: {
		addr: `192.168.1.${100 + i}`,
		port: 9732,
	},
	remote_socket_port: 9732,
	announced_version: {
		chain_name: "TEZOS_MAINNET",
		distributed_db_version: 2,
		p2p_version: 1,
	},
	private: false,
	local_metadata: {
		disable_mempool: false,
		private_node: false,
	},
	remote_metadata: {
		disable_mempool: false,
		private_node: false,
	},
}));

/** Mock pending operations */
export const mockPendingOperations = {
	applied: Array.from({ length: 15 }, (_, i) => ({
		hash: `op${i.toString().padStart(3, "0")}XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`,
		branch: mockBlockHeader.hash,
	})),
	refused: [],
	outdated: [],
	branch_refused: [],
	branch_delayed: [],
	unprocessed: [],
};
