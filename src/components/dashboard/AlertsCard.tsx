import { AlertTriangle, Bell, Info, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Alert, AlertsResponse } from "@/lib/types";

interface AlertsCardProps {
	data?: AlertsResponse;
	isLoading?: boolean;
}

function getSeverityIcon(severity: Alert["severity"]) {
	switch (severity) {
		case "error":
			return <XCircle className="h-4 w-4 text-destructive" />;
		case "warning":
			return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
		case "info":
			return <Info className="h-4 w-4 text-muted-foreground" />;
	}
}

function getSeverityBadgeVariant(
	severity: Alert["severity"],
): "destructive" | "warning" | "secondary" {
	switch (severity) {
		case "error":
			return "destructive";
		case "warning":
			return "warning";
		case "info":
			return "secondary";
	}
}

function formatTimeAgo(timestamp: string): string {
	const now = new Date();
	const date = new Date(timestamp);
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 60) {
		return `${diffMins}m ago`;
	}
	if (diffHours < 24) {
		return `${diffHours}h ago`;
	}
	return `${diffDays}d ago`;
}

export function AlertsCard({ data, isLoading }: AlertsCardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Alerts
					</CardTitle>
					<CardDescription>Recent alerts and notifications</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const alerts = data?.alerts ?? [];
	const unreadCount = data?.unreadCount ?? 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Alerts
					{unreadCount > 0 && (
						<Badge variant="destructive" className="ml-auto">
							{unreadCount} new
						</Badge>
					)}
				</CardTitle>
				<CardDescription>Recent alerts and notifications</CardDescription>
			</CardHeader>
			<CardContent>
				{alerts.length === 0 ? (
					<p className="text-sm text-muted-foreground">No recent alerts</p>
				) : (
					<div className="space-y-3">
						{alerts.map((alert) => (
							<div
								key={alert.id}
								className="flex items-start gap-3 rounded-lg border p-3"
							>
								{getSeverityIcon(alert.severity)}
								<div className="flex-1 space-y-1">
									<div className="flex items-center justify-between">
										<Badge variant={getSeverityBadgeVariant(alert.severity)}>
											{alert.type.replace(/_/g, " ")}
										</Badge>
										<span className="text-xs text-muted-foreground">
											{formatTimeAgo(alert.timestamp)}
										</span>
									</div>
									<p className="text-sm">{alert.message}</p>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
