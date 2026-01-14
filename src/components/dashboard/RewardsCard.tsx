import {
	ArrowDown,
	ArrowUp,
	HelpCircle,
	Minus,
	TrendingUp,
} from "lucide-react";
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
	Tooltip as ChartTooltip,
	ChartTooltipContent,
	XAxis,
	YAxis,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RewardsHistory } from "@/lib/types";

function StatLabel({ label, tooltip }: { label: string; tooltip: string }) {
	return (
		<p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
			{label}
			<Tooltip>
				<TooltipTrigger asChild>
					<HelpCircle className="h-3 w-3 cursor-help" />
				</TooltipTrigger>
				<TooltipContent>
					<p className="max-w-[200px]">{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</p>
	);
}

interface RewardsCardProps {
	data?: RewardsHistory;
	isLoading?: boolean;
}

// Tezos blue color palette
const TEZOS_BLUE = "#0D61FF";
const TEZOS_BLUE_LIGHT = "#4A90FF";

function formatXtzCompact(mutez: string | number): string {
	const xtz =
		typeof mutez === "string" ? Number(BigInt(mutez)) / 1_000_000 : mutez;
	if (xtz >= 1_000_000) {
		return `${(xtz / 1_000_000).toFixed(2)}M`;
	}
	if (xtz >= 1_000) {
		return `${(xtz / 1_000).toFixed(1)}K`;
	}
	return xtz.toFixed(1);
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

	// Filter out cycles with no rewards (future/in-progress cycles)
	const completedCycles = data.cycles.filter(
		(c) =>
			BigInt(c.totalRewards) > 0 ||
			BigInt(c.missedBakingRewards) > 0 ||
			BigInt(c.missedAttestationRewards) > 0,
	);

	if (completedCycles.length === 0) {
		return (
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Rewards History
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						No completed reward cycles yet
					</p>
				</CardContent>
			</Card>
		);
	}

	// Prepare chart data (reverse so oldest is first)
	const chartData = [...completedCycles].reverse().map((cycle) => ({
		cycle: cycle.cycle.toString(),
		baking: Number(BigInt(cycle.bakingRewards)) / 1_000_000,
		attestation: Number(BigInt(cycle.attestationRewards)) / 1_000_000,
		missed:
			(Number(BigInt(cycle.missedBakingRewards)) +
				Number(BigInt(cycle.missedAttestationRewards))) /
			1_000_000,
	}));

	// Calculate stats (using only completed cycles)
	const totalEarnedNum = Number(BigInt(data.totalEarned)) / 1_000_000;
	const totalMissedNum = Number(BigInt(data.totalMissed)) / 1_000_000;
	const avgPerCycle =
		completedCycles.length > 0 ? totalEarnedNum / completedCycles.length : 0;
	const efficiency =
		totalEarnedNum + totalMissedNum > 0
			? (totalEarnedNum / (totalEarnedNum + totalMissedNum)) * 100
			: 100;

	// Calculate trend (compare last 3 completed cycles avg vs previous cycles avg)
	// Need at least 4 completed cycles to calculate a meaningful trend
	let trendPercent = 0;
	if (completedCycles.length >= 4) {
		const recentCycles = completedCycles.slice(0, 3);
		const olderCycles = completedCycles.slice(3);
		const recentAvg =
			recentCycles.reduce((sum, c) => sum + Number(BigInt(c.totalRewards)), 0) /
			recentCycles.length /
			1_000_000;
		const olderAvg =
			olderCycles.reduce((sum, c) => sum + Number(BigInt(c.totalRewards)), 0) /
			olderCycles.length /
			1_000_000;
		trendPercent = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
	}

	return (
		<Card className="lg:col-span-2">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Rewards History
						</CardTitle>
						<CardDescription>
							Last {completedCycles.length} cycles
						</CardDescription>
					</div>
					<div className="text-right">
						<p className="text-2xl font-bold">
							{formatXtzCompact(data.totalEarned)} XTZ
						</p>
						<p className="text-xs text-muted-foreground">total earned</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{/* Stats row */}
				<div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
					<div className="text-center">
						<p className="text-lg font-semibold">
							{formatXtzCompact(avgPerCycle)} XTZ
						</p>
						<p className="text-xs text-muted-foreground">avg/cycle</p>
					</div>
					<div className="text-center">
						<p className="text-lg font-semibold flex items-center justify-center gap-1">
							{trendPercent > 5 ? (
								<ArrowUp className="h-4 w-4 text-green-500" />
							) : trendPercent < -5 ? (
								<ArrowDown className="h-4 w-4 text-red-500" />
							) : (
								<Minus className="h-4 w-4 text-muted-foreground" />
							)}
							{Math.abs(trendPercent).toFixed(1)}%
						</p>
						<StatLabel
							label="trend"
							tooltip="Compares your last 3 cycles to earlier cycles. Shows if rewards are increasing or decreasing."
						/>
					</div>
					<div className="text-center">
						<p className="text-lg font-semibold">{efficiency.toFixed(1)}%</p>
						<StatLabel
							label="efficiency"
							tooltip="Percentage of potential rewards actually earned. 100% means no missed baking or attestation opportunities."
						/>
					</div>
				</div>

				<ChartContainer className="h-[180px]">
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
						<ChartTooltip
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

				<div className="mt-3 flex items-center justify-between">
					<div className="flex gap-4 text-xs text-muted-foreground">
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
					{totalMissedNum > 0 && (
						<Badge variant="destructive" className="text-xs">
							{formatXtzCompact(totalMissedNum)} XTZ missed
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
