import { BookOpen, CircleHelp, ExternalLink, FileText, Globe } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HelpDropdown() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="text-muted-foreground hover:text-foreground transition-colors p-1"
					aria-label="Help"
				>
					<CircleHelp className="h-5 w-5" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>Resources</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<a
						href="https://tezos.gitlab.io/introduction/howtouse.html"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 cursor-pointer"
					>
						<BookOpen className="h-4 w-4" />
						Octez Documentation
						<ExternalLink className="h-3 w-3 ml-auto opacity-50" />
					</a>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<a
						href="https://tzkt.io"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 cursor-pointer"
					>
						<Globe className="h-4 w-4" />
						TzKT Block Explorer
						<ExternalLink className="h-3 w-3 ml-auto opacity-50" />
					</a>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<a
						href="https://opentezos.com"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 cursor-pointer"
					>
						<FileText className="h-4 w-4" />
						OpenTezos
						<ExternalLink className="h-3 w-3 ml-auto opacity-50" />
					</a>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
