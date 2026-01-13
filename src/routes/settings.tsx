import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle,
	ExternalLink,
	Loader2,
	Server,
	Settings,
	Wallet,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaveSettings, useSettings } from "@/hooks";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
	const navigate = useNavigate();
	const { data: settings, isLoading } = useSettings();
	const saveSettings = useSaveSettings();

	const [nodeUrl, setNodeUrl] = useState("");
	const [dalNodeUrl, setDalNodeUrl] = useState("");
	const [bakerAddress, setBakerAddress] = useState("");
	const [bakerAlias, setBakerAlias] = useState("");
	const [initialized, setInitialized] = useState(false);

	// Initialize form with existing settings
	if (settings && !initialized) {
		setNodeUrl(settings.nodeUrl);
		setDalNodeUrl(settings.dalNodeUrl ?? "");
		setBakerAddress(settings.bakerAddress);
		setBakerAlias(settings.bakerAlias ?? "");
		setInitialized(true);
	}

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
					navigate({ to: "/" });
				},
			},
		);
	};

	const isValid = nodeUrl.trim() && bakerAddress.trim();
	const isFirstSetup = !settings && !isLoading;

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-3 md:px-6 md:py-4">
				<div className="flex items-center gap-4">
					<Link
						to="/"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div className="flex items-center gap-2">
						<Settings className="h-6 w-6 text-muted-foreground" />
						<h1 className="text-xl font-bold">
							{isFirstSetup ? "Welcome to Dough" : "Settings"}
						</h1>
					</div>
				</div>
			</header>

			<main className="container mx-auto p-4 md:p-6 max-w-2xl">
				{isLoading ? (
					<div className="space-y-6">
						<Skeleton className="h-64 w-full" />
						<Skeleton className="h-48 w-full" />
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
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Server className="h-5 w-5" />
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
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Wallet className="h-5 w-5" />
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
							{!isFirstSetup && (
								<Link to="/">
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</Link>
							)}
						</div>

						{saveSettings.isError && (
							<p className="text-sm text-destructive">
								Failed to save settings. Please try again.
							</p>
						)}

						<Card>
							<CardHeader>
								<CardTitle>Resources</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<a
									href="https://tezos.gitlab.io/introduction/howtouse.html"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									<ExternalLink className="h-4 w-4" />
									Octez Documentation
								</a>
								<a
									href="https://tzkt.io"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									<ExternalLink className="h-4 w-4" />
									TzKT Block Explorer
								</a>
							</CardContent>
						</Card>
					</form>
				)}
			</main>
		</div>
	);
}
