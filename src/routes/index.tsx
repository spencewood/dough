import { createFileRoute } from "@tanstack/react-router";

import {
	BakerStatusCard,
	Header,
	NodeHealthCard,
	RightsCard,
} from "@/components/dashboard";
import {
	useAttestationRights,
	useBakerStatus,
	useBakingRights,
	useNodeHealth,
} from "@/hooks";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
	const nodeHealth = useNodeHealth();
	const bakerStatus = useBakerStatus();
	const bakingRights = useBakingRights();
	const attestationRights = useAttestationRights();

	const hasError =
		nodeHealth.error ||
		bakerStatus.error ||
		bakingRights.error ||
		attestationRights.error;

	return (
		<div className="min-h-screen bg-background">
			<Header
				nodeHealth={nodeHealth.data}
				bakerAlias={bakerStatus.data?.alias}
				bakerAddress={bakerStatus.data?.address}
			/>

			<main className="container mx-auto p-6">
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
				</div>

				{hasError && (
					<div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
						<p className="text-destructive text-sm">
							{nodeHealth.error?.message ||
								bakerStatus.error?.message ||
								bakingRights.error?.message ||
								attestationRights.error?.message}
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
