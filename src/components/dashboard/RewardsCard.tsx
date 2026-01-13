import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ChartContainer,
	ChartTooltipContent,
	Tooltip,
	XAxis,
	YAxis,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { RewardsHistory } from "@/lib/types";

interface RewardsCardProps {
	data?: RewardsHistory;
	isLoading?: boolean;
}

// Tezos blue color palette
const TEZOS_BLUE = "#0D61FF";
const TEZOS_BLUE_LIGHT = "#4A90FF";

function formatXtzFull(mutez: string): string {
	const xtz = Number(BigInt(mutez)) / 1_000_000;
	return `${xtz.toLocaleString(undefined, { maximumFractionDigits: 2 })} XTZ`;
}

export function RewardsCard({ data, isLoading }: RewardsCardProps) {
	if (isLoading) {
		return (
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Rewards History
					</CardTitle>
					<CardDescription>Earnings by cycle</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-[200px] w-full" />
						<div className="flex gap-4">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data || data.cycles.length === 0) {
		return (
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Rewards History
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No rewards data available</p>
				</CardContent>
			</Card>
		);
	}

	// Prepare chart data (reverse so oldest is first)
	const chartData = [...data.cycles].reverse().map((cycle) => ({
		cycle: cycle.cycle.toString(),
		baking: Number(BigInt(cycle.bakingRewards)) / 1_000_000,
		attestation: Number(BigInt(cycle.attestationRewards)) / 1_000_000,
		missed:
			(Number(BigInt(cycle.missedBakingRewards)) +
				Number(BigInt(cycle.missedAttestationRewards))) /
			1_000_000,
	}));

	return (
		<Card className="lg:col-span-2">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Rewards History
				</CardTitle>
				<CardDescription>Earnings by cycle (last 10 cycles)</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer className="h-[200px]">
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="cycle"
							tick={{ fontSize: 12 }}
							tickLine={false}
							axisLine={false}
							className="text-muted-foreground"
						/>
						<YAxis
							tick={{ fontSize: 12 }}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => `${value}`}
							className="text-muted-foreground"
						/>
						<Tooltip
							cursor={false}
							content={
								<ChartTooltipContent
									formatter={(value) =>
										`${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} XTZ`
									}
								/>
							}
						/>
						<Bar
							dataKey="baking"
							name="Baking"
							stackId="rewards"
							fill={TEZOS_BLUE}
							radius={[0, 0, 0, 0]}
						/>
						<Bar
							dataKey="attestation"
							name="Attestation"
							stackId="rewards"
							fill={TEZOS_BLUE_LIGHT}
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>

				<div className="mt-4 flex flex-wrap gap-4">
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Total Earned:</span>
						<Badge variant="success">{formatXtzFull(data.totalEarned)}</Badge>
					</div>
					{BigInt(data.totalMissed) > 0 && (
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">
								Total Missed:
							</span>
							<Badge variant="destructive">
								{formatXtzFull(data.totalMissed)}
							</Badge>
						</div>
					)}
				</div>

				<div className="mt-3 flex gap-4 text-xs text-muted-foreground">
					<div className="flex items-center gap-1">
						<div
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: TEZOS_BLUE }}
						/>
						Baking
					</div>
					<div className="flex items-center gap-1">
						<div
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: TEZOS_BLUE_LIGHT }}
						/>
						Attestation
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
