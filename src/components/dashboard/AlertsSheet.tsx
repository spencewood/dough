import { AlertTriangle, Bell, Info, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { Alert, AlertsResponse } from "@/lib/types";

interface AlertsSheetProps {
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

export function AlertsSheet({ data, isLoading }: AlertsSheetProps) {
	const alerts = data?.alerts ?? [];
	const unreadCount = data?.unreadCount ?? 0;

	return (
		<Sheet>
			<SheetTrigger asChild>
				<button
					type="button"
					className="relative text-muted-foreground hover:text-foreground transition-colors p-1"
					aria-label={`Alerts${unreadCount > 0 ? ` (${unreadCount} new)` : ""}`}
				>
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</button>
			</SheetTrigger>
			<SheetContent side="right" className="w-full sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Alerts
						{unreadCount > 0 && (
							<Badge variant="destructive" className="ml-2">
								{unreadCount} new
							</Badge>
						)}
					</SheetTitle>
					<SheetDescription>Recent alerts and notifications</SheetDescription>
				</SheetHeader>
				<div className="mt-6">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
						</div>
					) : alerts.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
							<p className="text-sm text-muted-foreground">No recent alerts</p>
							<p className="text-xs text-muted-foreground/70 mt-1">
								You're all caught up!
							</p>
						</div>
					) : (
						<div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
							{alerts.map((alert) => (
								<div
									key={alert.id}
									className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
								>
									{getSeverityIcon(alert.severity)}
									<div className="flex-1 space-y-1 min-w-0">
										<div className="flex items-center justify-between gap-2">
											<Badge
												variant={getSeverityBadgeVariant(alert.severity)}
												className="shrink-0"
											>
												{alert.type.replace(/_/g, " ")}
											</Badge>
											<span className="text-xs text-muted-foreground shrink-0">
												{formatTimeAgo(alert.timestamp)}
											</span>
										</div>
										<p className="text-sm">{alert.message}</p>
										{alert.level && (
											<p className="text-xs text-muted-foreground">
												Level: {alert.level.toLocaleString()}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
