import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

export {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
};

interface ChartContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function ChartContainer({ children, className }: ChartContainerProps) {
	return (
		<div className={cn("w-full h-[200px]", className)}>
			<ResponsiveContainer width="100%" height="100%">
				{children as React.ReactElement}
			</ResponsiveContainer>
		</div>
	);
}

interface ChartTooltipContentProps {
	active?: boolean;
	payload?: Array<{
		name: string;
		value: number;
		color: string;
	}>;
	label?: string;
	formatter?: (value: number, name: string) => string;
}

export function ChartTooltipContent({
	active,
	payload,
	label,
	formatter,
}: ChartTooltipContentProps) {
	if (!active || !payload?.length) {
		return null;
	}

	return (
		<div className="rounded-lg border bg-background p-2 shadow-sm">
			<div className="text-xs text-muted-foreground mb-1">{label}</div>
			<div className="space-y-1">
				{payload.map((entry) => (
					<div key={entry.name} className="flex items-center gap-2 text-sm">
						<div
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-muted-foreground">{entry.name}:</span>
						<span className="font-medium">
							{formatter ? formatter(entry.value, entry.name) : entry.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
