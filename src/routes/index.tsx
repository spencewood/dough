import { createFileRoute } from "@tanstack/react-router";

import {
	BakerStatusCard,
	Header,
	NodeHealthCard,
} from "@/components/dashboard";
import { useBakerStatus, useNodeHealth } from "@/hooks";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
	const nodeHealth = useNodeHealth();
	const bakerStatus = useBakerStatus();

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
				</div>

				{(nodeHealth.error || bakerStatus.error) && (
					<div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
						<p className="text-destructive text-sm">
							{nodeHealth.error?.message || bakerStatus.error?.message}
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
