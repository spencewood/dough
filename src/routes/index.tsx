import { createFileRoute } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { useState } from "react";

import {
	BakerStatusCard,
	DalStatusCard,
	Header,
	NetworkStatsCard,
	NodeHealthCard,
	ParticipationCard,
	RewardsCard,
	RightsCard,
	SettingsModal,
} from "@/components/dashboard";
import { CardErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useAlerts,
	useAttestationRights,
	useBakerDomain,
	useBakerParticipation,
	useBakerStatus,
	useBakingRights,
	useBlockStream,
	useDalStatus,
	useNetworkStats,
	useNodeHealth,
	useRewards,
	useSettings,
} from "@/hooks";
import { getDashboardData } from "@/lib/server/dashboard-data";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		const { queryClient } = context;

		// Fetch all dashboard data on the server
		const data = await getDashboardData();

		// Pre-populate the query cache with server-fetched data
		// This eliminates CLS by having data available on first render
		if (data.settings !== undefined) {
			queryClient.setQueryData(["settings"], data.settings);
		}
		if (data.nodeHealth) {
			queryClient.setQueryData(["node", "health"], data.nodeHealth);
		}
		if (data.bakerStatus) {
			queryClient.setQueryData(["baker", "status"], data.bakerStatus);
		}
		if (data.bakerParticipation) {
			queryClient.setQueryData(
				["baker", "participation"],
				data.bakerParticipation,
			);
		}
		if (data.bakingRights) {
			queryClient.setQueryData(
				["baker", "rights", "baking"],
				data.bakingRights,
			);
		}
		if (data.attestationRights) {
			queryClient.setQueryData(
				["baker", "rights", "attestation"],
				data.attestationRights,
			);
		}
		if (data.rewards) {
			queryClient.setQueryData(["baker", "rewards"], data.rewards);
		}
		if (data.dalStatus) {
			queryClient.setQueryData(["dal", "status"], data.dalStatus);
		}
		if (data.networkStats) {
			queryClient.setQueryData(["network", "stats"], data.networkStats);
		}
		if (data.alerts) {
			queryClient.setQueryData(["alerts"], data.alerts);
		}

		return data;
	},
	component: Dashboard,
});

function Dashboard() {
	const { data: settings, isLoading: settingsLoading } = useSettings();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const nodeHealth = useNodeHealth();
	const bakerStatus = useBakerStatus();
	const bakerParticipation = useBakerParticipation();
	const bakingRights = useBakingRights();
	const attestationRights = useAttestationRights();
	const rewards = useRewards();
	const dalStatus = useDalStatus();
	const alerts = useAlerts();
	const networkStats = useNetworkStats();
	const blockStream = useBlockStream();
	const bakerDomain = useBakerDomain();

	// Show loading while checking settings
	if (settingsLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-4">
					<Cookie className="h-12 w-12 text-[#0D61FF] mx-auto animate-pulse" />
					<Skeleton className="h-4 w-32 mx-auto" />
				</div>
			</div>
		);
	}

	// Show settings modal if not configured
	const needsSetup = !settings && !settingsLoading;

	const hasError =
		nodeHealth.error ||
		bakerStatus.error ||
		bakerParticipation.error ||
		bakingRights.error ||
		attestationRights.error ||
		rewards.error ||
		dalStatus.error ||
		alerts.error ||
		networkStats.error;

	// Show setup modal on first run
	if (needsSetup) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-4">
					<Cookie className="h-12 w-12 text-[#0D61FF] mx-auto" />
					<h1 className="text-xl font-bold">Welcome to Dough</h1>
					<p className="text-muted-foreground">
						Let's set up your baker dashboard
					</p>
				</div>
				<SettingsModal open={true} onOpenChange={() => {}} required />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Header
				nodeHealth={nodeHealth.data}
				bakerAlias={bakerStatus.data?.alias}
				bakerAddress={bakerStatus.data?.address}
				bakerDomain={bakerDomain.data?.domain}
				alerts={alerts.data}
				alertsLoading={alerts.isLoading}
				onSettingsClick={() => setSettingsOpen(true)}
			/>

			<SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

			<main className="container mx-auto p-4 md:p-6">
				<div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* Row 1: Time-sensitive info */}
					<CardErrorBoundary
						cardTitle="Network"
						onRetry={() => networkStats.refetch()}
					>
						<NetworkStatsCard
							data={networkStats.data}
							isLoading={networkStats.isLoading}
							blockStream={blockStream}
						/>
					</CardErrorBoundary>
					<CardErrorBoundary
						cardTitle="Rewards"
						onRetry={() => rewards.refetch()}
					>
						<RewardsCard data={rewards.data} isLoading={rewards.isLoading} />
					</CardErrorBoundary>
					<CardErrorBoundary
						cardTitle="Baker Status"
						onRetry={() => bakerStatus.refetch()}
					>
						<BakerStatusCard
							data={bakerStatus.data}
							isLoading={bakerStatus.isLoading}
						/>
					</CardErrorBoundary>

					{/* Row 2: Performance & upcoming */}
					<CardErrorBoundary
						cardTitle="Participation"
						onRetry={() => bakerParticipation.refetch()}
					>
						<ParticipationCard
							data={bakerParticipation.data}
							isLoading={bakerParticipation.isLoading}
						/>
					</CardErrorBoundary>
					<CardErrorBoundary
						cardTitle="Rights"
						onRetry={() => {
							bakingRights.refetch();
							attestationRights.refetch();
						}}
					>
						<RightsCard
							bakingRights={bakingRights.data}
							attestationRights={attestationRights.data}
							isLoading={bakingRights.isLoading || attestationRights.isLoading}
						/>
					</CardErrorBoundary>
					<CardErrorBoundary
						cardTitle="Node Health"
						onRetry={() => nodeHealth.refetch()}
					>
						<NodeHealthCard
							data={nodeHealth.data}
							isLoading={nodeHealth.isLoading}
						/>
					</CardErrorBoundary>

					{/* Row 3: Technical status */}
					<CardErrorBoundary
						cardTitle="DAL Status"
						onRetry={() => dalStatus.refetch()}
					>
						<DalStatusCard
							data={dalStatus.data}
							isLoading={dalStatus.isLoading}
						/>
					</CardErrorBoundary>
				</div>

				{hasError && (
					<div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
						<p className="text-destructive text-sm">
							{nodeHealth.error?.message ||
								bakerStatus.error?.message ||
								bakerParticipation.error?.message ||
								bakingRights.error?.message ||
								attestationRights.error?.message ||
								rewards.error?.message ||
								dalStatus.error?.message ||
								alerts.error?.message ||
								networkStats.error?.message}
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
