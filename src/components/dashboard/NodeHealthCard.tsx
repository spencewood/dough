import { Activity, ArrowDown, ArrowUp, Cpu, HardDrive, Network, Server } from "lucide-react";
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

function truncateHash(hash: string): string {
	if (hash.length <= 12) return hash;
	return `${hash.slice(0, 8)}...${hash.slice(-4)}`;
}

function formatBytes(bytes: number): string {
	if (bytes >= 1_000_000_000) {
		return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
	}
	if (bytes >= 1_000_000) {
		return `${(bytes / 1_000_000).toFixed(1)} MB`;
	}
	if (bytes >= 1_000) {
		return `${(bytes / 1_000).toFixed(1)} KB`;
	}
	return `${bytes} B`;
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

					{data.nodeVersion && (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<HardDrive className="h-4 w-4" />
								Version
							</div>
							<div className="text-right">
								<p className="font-mono text-sm">{data.nodeVersion}</p>
								{data.nodeCommit && (
									<p className="text-xs text-muted-foreground">{data.nodeCommit}</p>
								)}
							</div>
						</div>
					)}

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Network className="h-4 w-4" />
							Peers
						</div>
						<Badge variant="secondary">{data.peerCount}</Badge>
					</div>

					{(data.networkBytesRecv !== undefined || data.networkBytesSent !== undefined) && (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								Network I/O
							</div>
							<div className="flex items-center gap-3 text-xs font-mono">
								{data.networkBytesRecv !== undefined && (
									<span className="flex items-center gap-1">
										<ArrowDown className="h-3 w-3 text-green-500" />
										{formatBytes(data.networkBytesRecv)}
									</span>
								)}
								{data.networkBytesSent !== undefined && (
									<span className="flex items-center gap-1">
										<ArrowUp className="h-3 w-3 text-blue-500" />
										{formatBytes(data.networkBytesSent)}
									</span>
								)}
							</div>
						</div>
					)}

					{data.memoryUsedMb !== undefined && (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Cpu className="h-4 w-4" />
								Memory
							</div>
							<span className="font-mono text-sm">{data.memoryUsedMb.toLocaleString()} MB</span>
						</div>
					)}

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Mempool
						</div>
						<Badge variant="secondary">{data.mempoolSize} ops</Badge>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Head Block
						</div>
						<p className="font-mono text-sm">
							{data.headLevel.toLocaleString()}
						</p>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							Hash
						</div>
						<p className="font-mono text-xs">{truncateHash(data.headHash)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
