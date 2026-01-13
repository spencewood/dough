/**
 * DAL (Data Availability Layer) Node RPC Types
 */

/** DAL peer connection info */
export interface DALConnection {
	peer_id: string;
	host: string;
	port: number;
}

/** DAL gossipsub connections response */
export interface DALGossipsubConnections {
	connections: DALConnection[];
}

/** DAL profile subscription */
export interface DALProfile {
	slot_indices: number[];
}

/** DAL node status */
export interface DALNodeStatus {
	isConnected: boolean;
	peerCount: number;
	subscribedSlots: number[];
}
