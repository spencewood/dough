import { Coins, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BakerStatus } from "@/lib/types";

interface BakerStatusCardProps {
	data?: BakerStatus;
	isLoading?: boolean;
}

function formatTez(mutez: string): string {
	const tez = Number(mutez) / 1_000_000;
	if (tez >= 1_000_000) {
		return `${(tez / 1_000_000).toFixed(2)}M`;
	}
	if (tez >= 1_000) {
		return `${(tez / 1_000).toFixed(2)}K`;
	}
	return tez.toFixed(2);
}

export function BakerStatusCard({ data, isLoading }: BakerStatusCardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Wallet className="h-5 w-5" />
						Baker Status
					</CardTitle>
					<CardDescription>Delegate information</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Wallet className="h-5 w-5" />
						Baker Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No data available</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Wallet className="h-5 w-5" />
					Baker Status
				</CardTitle>
				<CardDescription>
					{data.alias || data.address.slice(0, 8)}...
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Status
						</div>
						<Badge variant={data.isDeactivated ? "destructive" : "success"}>
							{data.isDeactivated ? "Deactivated" : "Active"}
						</Badge>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Coins className="h-4 w-4" />
							Full Balance
						</div>
						<p className="font-mono">{formatTez(data.fullBalance)} XTZ</p>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Frozen Deposits
						</div>
						<p className="font-mono">{formatTez(data.frozenDeposits)} XTZ</p>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Staking Balance
						</div>
						<p className="font-mono">{formatTez(data.stakingBalance)} XTZ</p>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Delegated Balance
						</div>
						<p className="font-mono">{formatTez(data.delegatedBalance)} XTZ</p>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Users className="h-4 w-4" />
							Delegators
						</div>
						<Badge variant="secondary">{data.delegatorCount}</Badge>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Capacity Used
						</div>
						<div className="flex items-center gap-2">
							<div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
								<div
									className="h-full bg-primary rounded-full"
									style={{
										width: `${Math.min(data.stakingCapacityUsed, 100)}%`,
									}}
								/>
							</div>
							<span className="text-xs text-muted-foreground">
								{data.stakingCapacityUsed.toFixed(1)}%
							</span>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Grace Period
						</div>
						<Badge variant="outline">{data.gracePeriod} cycles</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
