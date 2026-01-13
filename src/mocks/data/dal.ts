import type { DALNodeStatus } from "@/lib/types";

/** Mock DAL node status for development */
export const mockDalStatus: DALNodeStatus = {
	isConnected: true,
	peerCount: 8,
	subscribedSlots: [0, 1, 2, 3],
};

/** Mock DAL gossipsub connections (raw RPC format) */
export const mockDalConnections = {
	connections: [
		{
			peer_id: "12D3KooWDAL1xxxxx",
			host: "dal-node-1.example.com",
			port: 11732,
		},
		{
			peer_id: "12D3KooWDAL2xxxxx",
			host: "dal-node-2.example.com",
			port: 11732,
		},
		{
			peer_id: "12D3KooWDAL3xxxxx",
			host: "dal-node-3.example.com",
			port: 11732,
		},
		{
			peer_id: "12D3KooWDAL4xxxxx",
			host: "dal-node-4.example.com",
			port: 11732,
		},
		{
			peer_id: "12D3KooWDAL5xxxxx",
			host: "dal-node-5.example.com",
			port: 11732,
		},
		{
			peer_id: "12D3KooWDAL6xxxxx",
			host: "dal-node-6.example.com",
			port: 11732,
		},
		{
			peer_id: "12D3KooWDAL7xxxxx",
			host: "dal-node-7.example.com",
			port: 11732,
		},
		{
			peer_id: "12D3KooWDAL8xxxxx",
			host: "dal-node-8.example.com",
			port: 11732,
		},
	],
};

/** Mock DAL profile (subscribed slots) */
export const mockDalProfile = {
	slot_indices: [0, 1, 2, 3],
};
