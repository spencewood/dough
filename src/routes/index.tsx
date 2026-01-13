import { createFileRoute } from "@tanstack/react-router";

import {
	AlertsCard,
	BakerStatusCard,
	DalStatusCard,
	Header,
	NodeHealthCard,
	RewardsCard,
	RightsCard,
} from "@/components/dashboard";
import {
	useAlerts,
	useAttestationRights,
	useBakerStatus,
	useBakingRights,
	useDalStatus,
	useNodeHealth,
	useRewards,
} from "@/hooks";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
	const nodeHealth = useNodeHealth();
	const bakerStatus = useBakerStatus();
	const bakingRights = useBakingRights();
	const attestationRights = useAttestationRights();
	const rewards = useRewards();
	const dalStatus = useDalStatus();
	const alerts = useAlerts();

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
