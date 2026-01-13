import { Activity, Clock, Network, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { NodeHealth } from "@/lib/types";

interface NodeHealthCardProps {
	data?: NodeHealth;
	isLoading?: boolean;
}

function formatTimestamp(timestamp: string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);

	if (diffSecs < 60) {
		return `${diffSecs}s ago`;
	}
	if (diffSecs < 3600) {
		return `${Math.floor(diffSecs / 60)}m ago`;
	}
	return date.toLocaleTimeString();
}

function truncateHash(hash: string): string {
	if (hash.length <= 12) return hash;
	return `${hash.slice(0, 8)}...${hash.slice(-4)}`;
}

export function NodeHealthCard({ data, isLoading }: NodeHealthCardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Server className="h-5 w-5" />
						Node Health
					</CardTitle>
					<CardDescription>Octez node status</CardDescription>
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
						<Server className="h-5 w-5" />
						Node Health
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
					<Server className="h-5 w-5" />
					Node Health
				</CardTitle>
				<CardDescription>Octez node status</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Activity className="h-4 w-4" />
							Sync Status
						</div>
						<Badge
							variant={data.syncState === "synced" ? "success" : "warning"}
						>
							{data.isBootstrapped ? "Bootstrapped" : "Not Bootstrapped"}
						</Badge>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Clock className="h-4 w-4" />
							Head Block
						</div>
						<div className="text-right">
							<p className="font-mono text-sm">
								Level {data.headLevel.toLocaleString()}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatTimestamp(data.headTimestamp)}
							</p>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>Hash</span>
						</div>
						<p className="font-mono text-xs">{truncateHash(data.headHash)}</p>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Network className="h-4 w-4" />
							Peers
						</div>
						<Badge variant="secondary">{data.peerCount}</Badge>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Mempool
						</div>
						<Badge variant="secondary">{data.mempoolSize} ops</Badge>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Protocol
						</div>
						<p className="font-mono text-xs">{data.protocol.slice(0, 8)}...</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
