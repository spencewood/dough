import { Database, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DALNodeStatus } from "@/lib/types";

interface DalStatusCardProps {
	data?: DALNodeStatus;
	isLoading?: boolean;
}

export function DalStatusCard({ data, isLoading }: DalStatusCardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						DAL Node
					</CardTitle>
					<CardDescription>Data Availability Layer status</CardDescription>
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
						<Database className="h-5 w-5" />
						DAL Node
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No DAL node configured</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Database className="h-5 w-5" />
					DAL Node
				</CardTitle>
				<CardDescription>Data Availability Layer status</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Status</span>
						<Badge variant={data.isConnected ? "success" : "destructive"}>
							{data.isConnected ? "Connected" : "Disconnected"}
						</Badge>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Users className="h-4 w-4" />
							Peers
						</div>
						<Badge variant="secondary">{data.peerCount}</Badge>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">
							Subscribed Slots
						</span>
						<div className="flex gap-1">
							{data.subscribedSlots.length > 0 ? (
								data.subscribedSlots.slice(0, 6).map((slot) => (
									<Badge key={slot} variant="outline" className="text-xs">
										{slot}
									</Badge>
								))
							) : (
								<span className="text-xs text-muted-foreground">None</span>
							)}
							{data.subscribedSlots.length > 6 && (
								<Badge variant="outline" className="text-xs">
									+{data.subscribedSlots.length - 6}
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
