import { createServerFn } from "@tanstack/react-start";
import { config } from "@/lib/api/config";
import {
	getAlerts,
	getAttestationRights,
	getBakerParticipation,
	getBakerStatus,
	getBakingRights,
	getDalStatus,
	getNetworkStats,
	getNodeHealth,
	getRewardsHistory,
} from "@/lib/api/octez";
import { getSettings } from "@/lib/db";

/**
 * Server function to fetch all dashboard data for SSR.
 * This runs on the server during route loading to eliminate CLS.
 */
export const getDashboardData = createServerFn({ method: "GET" }).handler(
	async () => {
		const settings = getSettings();

		// If not configured, return early with just settings state
		if (!settings || !config.isConfigured) {
			return {
				settings: null,
				nodeHealth: null,
				bakerStatus: null,
				bakerParticipation: null,
				bakingRights: null,
				attestationRights: null,
				rewards: null,
				dalStatus: null,
				networkStats: null,
				alerts: null,
			};
		}

		// Fetch all data in parallel for maximum speed
		const [
			nodeHealth,
			bakerStatus,
			bakerParticipation,
			bakingRights,
			attestationRights,
			rewards,
			dalStatus,
			networkStats,
			alerts,
		] = await Promise.all([
			getNodeHealth().catch((e) => {
				console.error("SSR: Failed to fetch node health:", e);
				return null;
			}),
			getBakerStatus().catch((e) => {
				console.error("SSR: Failed to fetch baker status:", e);
				return null;
			}),
			getBakerParticipation().catch((e) => {
				console.error("SSR: Failed to fetch baker participation:", e);
				return null;
			}),
			getBakingRights().catch((e) => {
				console.error("SSR: Failed to fetch baking rights:", e);
				return null;
			}),
			getAttestationRights().catch((e) => {
				console.error("SSR: Failed to fetch attestation rights:", e);
				return null;
			}),
			getRewardsHistory().catch((e) => {
				console.error("SSR: Failed to fetch rewards:", e);
				return null;
			}),
			getDalStatus().catch((e) => {
				console.error("SSR: Failed to fetch DAL status:", e);
				return null;
			}),
			getNetworkStats().catch((e) => {
				console.error("SSR: Failed to fetch network stats:", e);
				return null;
			}),
			getAlerts().catch((e) => {
				console.error("SSR: Failed to fetch alerts:", e);
				return null;
			}),
		]);

		return {
			settings,
			nodeHealth,
			bakerStatus,
			bakerParticipation,
			bakingRights,
			attestationRights,
			rewards,
			dalStatus,
			networkStats,
			alerts,
		};
	},
);
