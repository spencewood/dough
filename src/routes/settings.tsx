import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	ExternalLink,
	Server,
	Settings,
	Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
	// In production, these would come from environment variables
	// For now, show example configuration
	const config = {
		nodeUrl: import.meta.env.VITE_OCTEZ_NODE_URL || "http://localhost:8732",
		dalNodeUrl: import.meta.env.VITE_DAL_NODE_URL || "http://localhost:10732",
		bakerAddress: import.meta.env.VITE_BAKER_ADDRESS || "tz1YourBakerAddress",
		bakerAlias: import.meta.env.VITE_BAKER_ALIAS || "My Baker",
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b border-border bg-card px-6 py-4">
				<div className="flex items-center gap-4">
					<Link
						to="/"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div className="flex items-center gap-2">
						<Settings className="h-6 w-6 text-muted-foreground" />
						<h1 className="text-xl font-bold">Settings</h1>
					</div>
				</div>
			</header>

			<main className="container mx-auto p-6 max-w-2xl">
				<div className="space-y-6">
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
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Octez Node URL
								</span>
								<code className="text-sm bg-muted px-2 py-1 rounded">
									{config.nodeUrl}
								</code>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									DAL Node URL
								</span>
								<code className="text-sm bg-muted px-2 py-1 rounded">
									{config.dalNodeUrl}
								</code>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Wallet className="h-5 w-5" />
								Baker Configuration
							</CardTitle>
							<CardDescription>Your baker delegate information</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Alias</span>
								<span className="text-sm font-medium">{config.bakerAlias}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Address</span>
								<code className="text-sm bg-muted px-2 py-1 rounded font-mono">
									{config.bakerAddress}
								</code>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Environment Setup</CardTitle>
							<CardDescription>
								Configure your dashboard via environment variables
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Copy <code className="bg-muted px-1 rounded">.env.example</code>{" "}
								to <code className="bg-muted px-1 rounded">.env</code> and
								update the values:
							</p>
							<pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
								{`# Octez Node RPC URL
VITE_OCTEZ_NODE_URL=http://localhost:8732

# DAL Node RPC URL (optional)
VITE_DAL_NODE_URL=http://localhost:10732

# Baker/Delegate address
VITE_BAKER_ADDRESS=tz1YourBakerAddress

# Baker alias (for display)
VITE_BAKER_ALIAS=My Baker`}
							</pre>
							<div className="flex items-center gap-2 pt-2">
								<Badge variant="outline">Development Mode</Badge>
								<span className="text-xs text-muted-foreground">
									Mock data is served via MSW
								</span>
							</div>
						</CardContent>
					</Card>

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
				</div>
			</main>
		</div>
	);
}
