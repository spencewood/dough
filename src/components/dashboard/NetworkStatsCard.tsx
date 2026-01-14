import { Clock, Globe, Hash, Layers, Timer, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlockInfo, NetworkStats } from "@/lib/types";

interface NetworkStatsCardProps {
	data?: NetworkStats;
	isLoading?: boolean;
	// Block stream props
	blockStream?: {
		latestBlock: BlockInfo | null;
		serverDriftMs: number | null;
		browserDriftMs: number | null;
		isConnected: boolean;
		secondsSinceBlock: number;
		isNewBlock: boolean;
	};
}

const DEFAULT_BLOCK_TIME_SECONDS = 8; // Fallback if not yet loaded

/** Chain ID to network name mapping */
function getNetworkName(chainId: string): string {
	switch (chainId) {
		case "NetXdQprcVkpaWU":
			return "Mainnet";
		case "NetXnHfVqm9iesp":
			return "Ghostnet";
		case "NetXZSsxBpMQeAT":
			return "Nairobinet";
		default:
			return chainId.slice(0, 8);
	}
}

/** Format drift in ms with sign */
function formatDrift(driftMs: number | null): string {
	if (driftMs === null) return "---";
	const sign = driftMs >= 0 ? "+" : "";
	return `${sign}${driftMs}ms`;
}

export function NetworkStatsCard({
	data,
	isLoading,
	blockStream,
}: NetworkStatsCardProps) {
	// Use block stream data if available, otherwise fall back to polling data
	const secondsSinceBlock = blockStream?.secondsSinceBlock ?? 0;
	const isNewBlock = blockStream?.isNewBlock ?? false;
	const headLevel = blockStream?.latestBlock?.level ?? data?.headLevel;

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Globe className="h-5 w-5" />
						Network
					</CardTitle>
					<CardDescription>Tezos ecosystem stats</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-20 w-20 rounded-full mx-auto" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
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
						<Globe className="h-5 w-5" />
						Network
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No data available</p>
				</CardContent>
			</Card>
		);
	}

	const cycleProgress = (data.cyclePosition / data.blocksPerCycle) * 100;
	const blockTimeSeconds = data.minimalBlockDelay || DEFAULT_BLOCK_TIME_SECONDS;
	const blockProgress = Math.min(
		(secondsSinceBlock / blockTimeSeconds) * 100,
		100,
	);

	// SVG circle properties
	const radius = 36;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset =
		circumference - (blockProgress / 100) * circumference;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Globe className="h-5 w-5" />
					Network
					{/* Connection indicator */}
					{blockStream && (
						<span
							className="ml-auto"
							title={blockStream.isConnected ? "Live" : "Reconnecting..."}
						>
							{blockStream.isConnected ? (
								<Wifi className="h-4 w-4 text-green-500" />
							) : (
								<WifiOff className="h-4 w-4 text-muted-foreground animate-pulse" />
							)}
						</span>
					)}
				</CardTitle>
				<CardDescription>Tezos ecosystem stats</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{/* Block Time Animation */}
					<div className="flex flex-col items-center">
						<div
							className={`relative transition-transform duration-300 ${
								isNewBlock ? "scale-110" : "scale-100"
							}`}
						>
							<svg
								width="88"
								height="88"
								viewBox="0 0 88 88"
								className={`transform -rotate-90 ${
									isNewBlock ? "animate-pulse" : ""
								}`}
							>
								<title>Block time progress</title>
								{/* Background circle */}
								<circle
									cx="44"
									cy="44"
									r={radius}
									fill="none"
									stroke="currentColor"
									strokeWidth="6"
									className="text-muted/30"
								/>
								{/* Progress circle */}
								<circle
									cx="44"
									cy="44"
									r={radius}
									fill="none"
									stroke="currentColor"
									strokeWidth="6"
									strokeLinecap="round"
									strokeDasharray={circumference}
									strokeDashoffset={strokeDashoffset}
									className={`transition-all duration-100 ${
										secondsSinceBlock > blockTimeSeconds
											? "text-yellow-500"
											: "text-[#0D61FF]"
									}`}
								/>
							</svg>
							{/* Center text */}
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span
									className={`text-lg font-mono font-bold ${
										secondsSinceBlock > blockTimeSeconds
											? "text-yellow-500"
											: ""
									}`}
								>
									{secondsSinceBlock}s
								</span>
								<span className="text-[10px] text-muted-foreground">
									since block
								</span>
							</div>
						</div>
					</div>

					{/* Head Level */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Hash className="h-4 w-4" />
							Block
						</div>
						<p className="font-mono text-sm font-medium">
							{headLevel?.toLocaleString() ?? "---"}
						</p>
					</div>

					{/* Cycle Progress */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Layers className="h-4 w-4" />
								Cycle {data.currentCycle}
							</div>
							<span className="text-xs text-muted-foreground">
								{cycleProgress.toFixed(1)}%
							</span>
						</div>
						<div className="h-2 w-full rounded-full bg-muted/50">
							<div
								className="h-2 rounded-full bg-[#0D61FF] transition-all duration-300"
								style={{ width: `${cycleProgress}%` }}
							/>
						</div>
						<p className="text-xs text-muted-foreground text-center">
							{data.cyclePosition.toLocaleString()} /{" "}
							{data.blocksPerCycle.toLocaleString()} blocks
						</p>
					</div>

					{/* Clock Drift */}
					{blockStream && (
						<div className="space-y-1">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Clock className="h-4 w-4" />
								Clock Drift
							</div>
							<div className="grid grid-cols-2 gap-2 text-xs">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Server:</span>
									<span className="font-mono">
										{formatDrift(blockStream.serverDriftMs)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Browser:</span>
									<span className="font-mono">
										{formatDrift(blockStream.browserDriftMs)}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Protocol & Network */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Timer className="h-4 w-4" />
							Protocol
						</div>
						<Badge variant="secondary">{data.protocol}</Badge>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Network
						</div>
						<Badge variant="outline">{getNetworkName(data.chainId)}</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
