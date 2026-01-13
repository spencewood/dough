import { CalendarClock, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AttestationRight, BakingRight } from "@/lib/types";

interface RightsCardProps {
	bakingRights?: BakingRight[];
	attestationRights?: AttestationRight[];
	isLoading?: boolean;
}

function formatTimeUntil(timestamp: string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = date.getTime() - now.getTime();

	if (diffMs < 0) {
		return "past";
	}

	const diffMins = Math.floor(diffMs / 60000);
	if (diffMins < 60) {
		return `${diffMins}m`;
	}

	const diffHours = Math.floor(diffMins / 60);
	const remainingMins = diffMins % 60;
	return `${diffHours}h ${remainingMins}m`;
}

export function RightsCard({
	bakingRights,
	attestationRights,
	isLoading,
}: RightsCardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarClock className="h-5 w-5" />
						Upcoming Rights
					</CardTitle>
					<CardDescription>Baking & attestation schedule</CardDescription>
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

	const hasBakingRights = bakingRights && bakingRights.length > 0;
	const hasAttestationRights =
		attestationRights && attestationRights.length > 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CalendarClock className="h-5 w-5" />
					Upcoming Rights
				</CardTitle>
				<CardDescription>Baking & attestation schedule</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div>
						<h4 className="text-sm font-medium mb-3 flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Baking Rights
						</h4>
						{hasBakingRights ? (
							<div className="space-y-2">
								{bakingRights.slice(0, 5).map((right) => (
									<div
										key={`${right.level}-${right.round}`}
										className="flex items-center justify-between text-sm"
									>
										<div className="flex items-center gap-2">
											<span className="font-mono">
												{right.level.toLocaleString()}
											</span>
											{right.round > 0 && (
												<Badge variant="outline" className="text-xs">
													R{right.round}
												</Badge>
											)}
										</div>
										{right.estimatedTime && (
											<Badge variant="secondary">
												{formatTimeUntil(right.estimatedTime)}
											</Badge>
										)}
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								No upcoming baking rights
							</p>
						)}
					</div>

					<div>
						<h4 className="text-sm font-medium mb-3 flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							Attestation Rights
						</h4>
						{hasAttestationRights ? (
							<div className="space-y-2">
								{attestationRights.slice(0, 5).map((right) => (
									<div
										key={`${right.level}-${right.firstSlot}`}
										className="flex items-center justify-between text-sm"
									>
										<span className="font-mono">
											{right.level.toLocaleString()}
										</span>
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="text-xs">
												Slot {right.firstSlot}
											</Badge>
											<Badge variant="secondary">
												Power {right.attestationPower}
											</Badge>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								No upcoming attestation rights
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
