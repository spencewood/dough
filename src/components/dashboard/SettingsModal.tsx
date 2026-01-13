import { CheckCircle, Loader2, Server, Settings, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaveSettings, useSettings } from "@/hooks";

interface SettingsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** If true, the modal cannot be dismissed (for first-time setup) */
	required?: boolean;
}

export function SettingsModal({
	open,
	onOpenChange,
	required = false,
}: SettingsModalProps) {
	const { data: settings, isLoading } = useSettings();
	const saveSettings = useSaveSettings();

	const [nodeUrl, setNodeUrl] = useState("");
	const [dalNodeUrl, setDalNodeUrl] = useState("");
	const [bakerAddress, setBakerAddress] = useState("");
	const [bakerAlias, setBakerAlias] = useState("");

	// Initialize form with existing settings when they load
	useEffect(() => {
		if (settings) {
			setNodeUrl(settings.nodeUrl);
			setDalNodeUrl(settings.dalNodeUrl ?? "");
			setBakerAddress(settings.bakerAddress);
			setBakerAlias(settings.bakerAlias ?? "");
		}
	}, [settings]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		saveSettings.mutate(
			{
				nodeUrl,
				dalNodeUrl: dalNodeUrl || null,
				bakerAddress,
				bakerAlias: bakerAlias || null,
			},
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			},
		);
	};

	const isValid = nodeUrl.trim() && bakerAddress.trim();
	const isFirstSetup = !settings && !isLoading;

	// Prevent closing if required (first-time setup)
	const handleOpenChange = (newOpen: boolean) => {
		if (required && !newOpen) {
			return; // Don't allow closing
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						{isFirstSetup ? "Welcome to Dough" : "Settings"}
					</DialogTitle>
					<DialogDescription>
						{isFirstSetup
							? "Configure your Tezos baker dashboard to get started"
							: "Manage your node and baker configuration"}
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="space-y-6">
						<Skeleton className="h-48 w-full" />
						<Skeleton className="h-36 w-full" />
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						{isFirstSetup && (
							<Card className="border-[#0D61FF]/50 bg-[#0D61FF]/5">
								<CardContent className="pt-6">
									<p className="text-sm text-muted-foreground">
										Configure your Tezos baker dashboard by entering your node
										and baker details below. This only takes a minute!
									</p>
								</CardContent>
							</Card>
						)}

						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="flex items-center gap-2 text-base">
									<Server className="h-4 w-4" />
									Node Configuration
								</CardTitle>
								<CardDescription>
									RPC endpoints for your Tezos infrastructure
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="nodeUrl">Octez Node URL *</Label>
									<Input
										id="nodeUrl"
										type="url"
										placeholder="http://localhost:8732"
										value={nodeUrl}
										onChange={(e) => setNodeUrl(e.target.value)}
										required
									/>
									<p className="text-xs text-muted-foreground">
										The RPC endpoint of your Octez node
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="dalNodeUrl">DAL Node URL (optional)</Label>
									<Input
										id="dalNodeUrl"
										type="url"
										placeholder="http://localhost:10732"
										value={dalNodeUrl}
										onChange={(e) => setDalNodeUrl(e.target.value)}
									/>
									<p className="text-xs text-muted-foreground">
										Data Availability Layer node for DAL attestations
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="flex items-center gap-2 text-base">
									<Wallet className="h-4 w-4" />
									Baker Configuration
								</CardTitle>
								<CardDescription>
									Your baker delegate information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="bakerAddress">Baker Address *</Label>
									<Input
										id="bakerAddress"
										type="text"
										placeholder="tz1..."
										value={bakerAddress}
										onChange={(e) => setBakerAddress(e.target.value)}
										className="font-mono"
										required
									/>
									<p className="text-xs text-muted-foreground">
										Your baker's tz1 address
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="bakerAlias">Baker Alias (optional)</Label>
									<Input
										id="bakerAlias"
										type="text"
										placeholder="My Baker"
										value={bakerAlias}
										onChange={(e) => setBakerAlias(e.target.value)}
									/>
									<p className="text-xs text-muted-foreground">
										A friendly name for your baker
									</p>
								</div>
							</CardContent>
						</Card>

						<div className="flex gap-3">
							<Button
								type="submit"
								disabled={!isValid || saveSettings.isPending}
								className="flex-1"
							>
								{saveSettings.isPending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<CheckCircle className="h-4 w-4" />
										{isFirstSetup ? "Get Started" : "Save Settings"}
									</>
								)}
							</Button>
							{!required && (
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
								>
									Cancel
								</Button>
							)}
						</div>

						{saveSettings.isError && (
							<p className="text-sm text-destructive">
								Failed to save settings. Please try again.
							</p>
						)}
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
