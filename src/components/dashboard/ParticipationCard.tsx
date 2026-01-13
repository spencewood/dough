import { Activity, AlertTriangle, CheckCircle, HelpCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BakerParticipation } from "@/lib/types";

function InfoTooltip({ text }: { text: string }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<HelpCircle className="h-3 w-3 cursor-help text-muted-foreground" />
			</TooltipTrigger>
			<TooltipContent>
				<p className="max-w-[200px]">{text}</p>
			</TooltipContent>
		</Tooltip>
	);
}

interface ParticipationCardProps {
	data?: BakerParticipation;
	isLoading?: boolean;
}

function formatTez(mutez: string): string {
	const tez = Number(mutez) / 1_000_000;
	if (tez >= 1_000_000) {
		return `${(tez / 1_000_000).toFixed(2)}M`;
	}
	if (tez >= 1_000) {
		return `${(tez / 1_000).toFixed(1)}K`;
	}
	return tez.toFixed(2);
}

export function ParticipationCard({ data, isLoading }: ParticipationCardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Participation
					</CardTitle>
					<CardDescription>Current cycle attestation stats</CardDescription>
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
						<Activity className="h-5 w-5" />
						Participation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No data available</p>
				</CardContent>
			</Card>
		);
	}

	// Calculate participation rate
	const totalSlots = data.expectedCycleActivity;
	const completedSlots = totalSlots - data.missedSlots;
	const participationRate = totalSlots > 0 ? (completedSlots / totalSlots) * 100 : 100;

	// Determine health status
	const isAtRisk = data.remainingAllowedMissedSlots <= 10;
	const isCritical = data.remainingAllowedMissedSlots <= 3;
	const isPerfect = data.missedSlots === 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5" />
					Participation
					{isCritical ? (
						<Badge variant="destructive" className="ml-auto">Critical</Badge>
					) : isAtRisk ? (
						<Badge variant="warning" className="ml-auto">At Risk</Badge>
					) : isPerfect ? (
						<Badge variant="success" className="ml-auto">Perfect</Badge>
					) : null}
				</CardTitle>
				<CardDescription>Current cycle attestation stats</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{/* Warning banner if at risk */}
					{isAtRisk && (
						<div className={`flex items-center gap-2 p-2 rounded-md border ${
							isCritical
								? "bg-destructive/10 border-destructive/20"
								: "bg-yellow-500/10 border-yellow-500/20"
						}`}>
							<AlertTriangle className={`h-4 w-4 ${
								isCritical ? "text-destructive" : "text-yellow-500"
							}`} />
							<span className={`text-sm font-medium ${
								isCritical ? "text-destructive" : "text-yellow-500"
							}`}>
								Only {data.remainingAllowedMissedSlots} missed slots remaining
							</span>
						</div>
					)}

					{/* Participation Rate */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Participation Rate</span>
							<span className="font-mono font-medium">{participationRate.toFixed(1)}%</span>
						</div>
						<div className="h-2 w-full rounded-full bg-muted/50">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${
									isCritical ? "bg-destructive" : isAtRisk ? "bg-yellow-500" : "bg-green-500"
								}`}
								style={{ width: `${participationRate}%` }}
							/>
						</div>
					</div>

					{/* Missed Stats */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<XCircle className="h-4 w-4" />
							Missed Slots
							<InfoTooltip text="Attestation slots where your baker failed to participate this cycle." />
						</div>
						<span className={`font-mono ${data.missedSlots > 0 ? "text-yellow-500" : ""}`}>
							{data.missedSlots}
						</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Missed Levels
							<InfoTooltip text="Block levels where all assigned attestation slots were missed." />
						</div>
						<span className={`font-mono ${data.missedLevels > 0 ? "text-yellow-500" : ""}`}>
							{data.missedLevels}
						</span>
					</div>

					{/* Allowance */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<CheckCircle className="h-4 w-4" />
							Allowed Misses Left
							<InfoTooltip text="Remaining slots you can miss this cycle before losing attestation rewards." />
						</div>
						<Badge variant={isCritical ? "destructive" : isAtRisk ? "warning" : "secondary"}>
							{data.remainingAllowedMissedSlots}
						</Badge>
					</div>

					{/* Expected Activity */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Expected Activity
						</div>
						<span className="font-mono text-sm">{data.expectedCycleActivity} slots</span>
					</div>

					{/* Expected Rewards */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Expected Rewards
						</div>
						<span className="font-mono">{formatTez(data.expectedAttestingRewards)} XTZ</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
