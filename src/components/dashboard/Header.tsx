import { Cookie } from "lucide-react";

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
		<header className="border-b border-border bg-card px-6 py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-3">
						<Cookie className="h-9 w-9 text-[#0D61FF]" />
						<div>
							<h1 className="text-xl font-bold">{bakerAlias || "Dough"}</h1>
							{bakerAddress && (
								<p className="text-xs text-muted-foreground font-mono">
									{truncateAddress(bakerAddress)}
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4">
					{nodeHealth && (
						<div className="text-sm text-muted-foreground">
							<span className="font-mono">
								Level {nodeHealth.headLevel.toLocaleString()}
							</span>
						</div>
					)}
					{getSyncBadge()}
					<Badge variant="outline">{nodeHealth?.chainId || "mainnet"}</Badge>
				</div>
			</div>
		</header>
	);
}
