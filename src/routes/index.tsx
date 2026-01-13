import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

import {
	AlertsCard,
	BakerStatusCard,
	DalStatusCard,
	Header,
	NodeHealthCard,
	RewardsCard,
	RightsCard,
} from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useAlerts,
	useAttestationRights,
	useBakerStatus,
	useBakingRights,
	useDalStatus,
	useNodeHealth,
	useRewards,
	useSettings,
} from "@/hooks";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
	const { data: settings, isLoading: settingsLoading } = useSettings();
	const nodeHealth = useNodeHealth();
	const bakerStatus = useBakerStatus();
	const bakingRights = useBakingRights();
	const attestationRights = useAttestationRights();
	const rewards = useRewards();
	const dalStatus = useDalStatus();
	const alerts = useAlerts();

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

	// Redirect to settings if not configured
	if (!settings) {
		return <Navigate to="/settings" />;
	}

	const hasError =
		nodeHealth.error ||
		bakerStatus.error ||
		bakingRights.error ||
		attestationRights.error ||
		rewards.error ||
		dalStatus.error ||
		alerts.error;

	return (
		<div className="min-h-screen bg-background">
			<Header
				nodeHealth={nodeHealth.data}
				bakerAlias={bakerStatus.data?.alias}
				bakerAddress={bakerStatus.data?.address}
			/>

			<main className="container mx-auto p-4 md:p-6">
				<div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<NodeHealthCard
						data={nodeHealth.data}
						isLoading={nodeHealth.isLoading}
					/>
					<BakerStatusCard
						data={bakerStatus.data}
						isLoading={bakerStatus.isLoading}
					/>
					<RightsCard
						bakingRights={bakingRights.data}
						attestationRights={attestationRights.data}
						isLoading={bakingRights.isLoading || attestationRights.isLoading}
					/>
					<RewardsCard data={rewards.data} isLoading={rewards.isLoading} />
					<DalStatusCard
						data={dalStatus.data}
						isLoading={dalStatus.isLoading}
					/>
					<AlertsCard data={alerts.data} isLoading={alerts.isLoading} />
				</div>

				{hasError && (
					<div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
						<p className="text-destructive text-sm">
							{nodeHealth.error?.message ||
								bakerStatus.error?.message ||
								bakingRights.error?.message ||
								attestationRights.error?.message ||
								rewards.error?.message ||
								dalStatus.error?.message ||
								alerts.error?.message}
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
