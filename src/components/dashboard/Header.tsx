import { Link } from "@tanstack/react-router";
import { Cookie, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { NodeHealth } from "@/lib/types";

interface HeaderProps {
	nodeHealth?: NodeHealth;
	bakerAlias?: string;
	bakerAddress?: string;
}

export function Header({ nodeHealth, bakerAlias, bakerAddress }: HeaderProps) {
	const getSyncBadge = () => {
		if (!nodeHealth) {
			return <Badge variant="secondary">Loading...</Badge>;
		}

		switch (nodeHealth.syncState) {
			case "synced":
				return <Badge variant="success">Synced</Badge>;
			case "syncing":
				return <Badge variant="warning">Syncing</Badge>;
			case "stale":
				return <Badge variant="destructive">Stale</Badge>;
		}
	};

	const truncateAddress = (address: string) => {
		if (address.length <= 12) return address;
		return `${address.slice(0, 8)}...${address.slice(-4)}`;
	};

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-3 md:px-6 md:py-4">
			<div className="flex items-center justify-between gap-2">
				{/* Logo and title */}
				<Link to="/" className="flex items-center gap-2 md:gap-3 min-w-0">
					<Cookie className="h-7 w-7 md:h-9 md:w-9 text-[#0D61FF] shrink-0" />
					<div className="min-w-0">
						<h1 className="text-lg md:text-xl font-bold truncate">
							{bakerAlias || "Dough"}
						</h1>
						{bakerAddress && (
							<p className="text-xs text-muted-foreground font-mono hidden sm:block">
								{truncateAddress(bakerAddress)}
							</p>
						)}
					</div>
				</Link>

				{/* Status indicators */}
				<div className="flex items-center gap-2 md:gap-4 shrink-0">
					{nodeHealth && (
						<div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
							<span className="font-mono">
								Level {nodeHealth.headLevel.toLocaleString()}
							</span>
						</div>
					)}
					{getSyncBadge()}
					<Badge variant="outline" className="hidden md:inline-flex">
						{nodeHealth?.chainId || "mainnet"}
					</Badge>
					<Link
						to="/settings"
						className="text-muted-foreground hover:text-foreground transition-colors p-1"
					>
						<Settings className="h-5 w-5" />
					</Link>
				</div>
			</div>
		</header>
	);
}
