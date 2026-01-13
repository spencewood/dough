import type { BakerParticipation, BakerStatus, CycleRewards, RewardsHistory } from "@/lib/types";

/** Mock baker address - replace with actual in .env */
export const MOCK_BAKER_ADDRESS = "tz1YourBakerAddressHereXXXXXXXXXXXXXXX";
export const MOCK_BAKER_ALIAS = "mybaker.tez";

/** Mock baker status for development */
export const mockBakerStatus: BakerStatus = {
	address: MOCK_BAKER_ADDRESS,
	alias: MOCK_BAKER_ALIAS,
	fullBalance: "1234567890123", // ~1.2M XTZ in mutez
	frozenDeposits: "100000000000", // 100k XTZ
	stakingBalance: "5000000000000", // 5M XTZ
	delegatedBalance: "3765432109877", // ~3.7M XTZ
	delegatorCount: 127,
	isDeactivated: false,
	gracePeriod: 5,
	stakingCapacityUsed: 75.5,
	hasPendingDenunciations: false,
};

/** Mock participation stats for current cycle */
export const mockBakerParticipation: BakerParticipation = {
	expectedCycleActivity: 1200,
	minimalCycleActivity: 960,
	missedSlots: 3,
	missedLevels: 1,
	remainingAllowedMissedSlots: 237,
	expectedAttestingRewards: "3500000000", // 3.5K XTZ in mutez
};

/** Mock delegate RPC response (matches Taquito DelegatesResponse shape) */
export const mockDelegateResponse = {
	full_balance: "1234567890123",
	current_frozen_deposits: "100000000000",
	frozen_deposits: "100000000000",
	staking_balance: "5000000000000",
	delegated_contracts: Array.from(
		{ length: 127 },
		(_, i) => `tz1Delegator${i.toString().padStart(3, "0")}XXXXXXXXXXXXXXXXX`,
	),
	delegated_balance: "3765432109877",
	deactivated: false,
	grace_period: 5,
	pending_denunciations: false,
	voting_power: "5000000000000",
	active_consensus_key:
		"edpkXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
};

/** Mock baking rights */
export const mockBakingRights = [
	{
		level: 5_432_150,
		delegate: MOCK_BAKER_ADDRESS,
		round: 0,
		estimated_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min from now
	},
	{
		level: 5_432_280,
		delegate: MOCK_BAKER_ADDRESS,
		round: 0,
		estimated_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
	},
	{
		level: 5_432_450,
		delegate: MOCK_BAKER_ADDRESS,
		round: 0,
		estimated_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
	},
];

/** Mock attestation rights */
export const mockAttestationRights = [
	{
		level: 5_432_101,
		delegates: [
			{
				delegate: MOCK_BAKER_ADDRESS,
				first_slot: 42,
				attestation_power: 5,
			},
		],
	},
	{
		level: 5_432_102,
		delegates: [
			{
				delegate: MOCK_BAKER_ADDRESS,
				first_slot: 128,
				attestation_power: 3,
			},
		],
	},
];

/** Generate mock cycle rewards for the past N cycles */
function generateMockCycleRewards(numCycles: number): CycleRewards[] {
	const currentCycle = 750; // Approximate current mainnet cycle
	const cycles: CycleRewards[] = [];

	for (let i = 0; i < numCycles; i++) {
		const cycle = currentCycle - i;
		// Randomize rewards slightly for realism
		const baseReward = 15_000_000_000; // ~15 XTZ base
		const variance = Math.random() * 0.3 + 0.85; // 85% - 115%

		const bakingRewards = Math.floor(baseReward * 0.4 * variance).toString();
		const attestationRewards = Math.floor(
			baseReward * 0.6 * variance,
		).toString();
		const totalRewards = (
			BigInt(bakingRewards) + BigInt(attestationRewards)
		).toString();

		// Occasionally miss some rewards (5% chance)
		const missedBaking =
			Math.random() < 0.05
				? Math.floor(baseReward * 0.1 * Math.random()).toString()
				: "0";
		const missedAttestation =
			Math.random() < 0.05
				? Math.floor(baseReward * 0.05 * Math.random()).toString()
				: "0";

		cycles.push({
			cycle,
			bakingRewards,
			attestationRewards,
			totalRewards,
			missedBakingRewards: missedBaking,
			missedAttestationRewards: missedAttestation,
			ownStakingBalance: "1000000000000", // 1M XTZ
			externalStakingBalance: "4000000000000", // 4M XTZ
		});
	}

	return cycles;
}

/** Mock rewards history for the past 10 cycles */
export const mockRewardsHistory: RewardsHistory = (() => {
	const cycles = generateMockCycleRewards(10);
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
		delegate: MOCK_BAKER_ADDRESS,
		cycles,
		totalEarned,
		totalMissed,
	};
})();
