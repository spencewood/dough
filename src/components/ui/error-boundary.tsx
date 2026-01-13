import type { ErrorComponentProps } from "@tanstack/react-router";
import { Component, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onReset?: () => void;
	title?: string;
	description?: string;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		this.props.onReset?.();
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<ErrorFallback
					error={this.state.error}
					onReset={this.handleReset}
					title={this.props.title}
					description={this.props.description}
				/>
			);
		}

		return this.props.children;
	}
}

interface ErrorFallbackProps {
	error?: Error | null;
	onReset?: () => void;
	title?: string;
	description?: string;
}

export function ErrorFallback({
	error,
	onReset,
	title = "Something went wrong",
	description = "An error occurred while rendering this component.",
}: ErrorFallbackProps) {
	return (
		<Card className="border-destructive/50">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive">
					<AlertTriangle className="h-5 w-5" />
					{title}
				</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{error && (
						<div className="rounded-md bg-muted p-3">
							<p className="font-mono text-sm text-muted-foreground">
								{error.message}
							</p>
						</div>
					)}
					{onReset && (
						<Button variant="outline" size="sm" onClick={onReset}>
							<RefreshCw className="mr-2 h-4 w-4" />
							Try again
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

interface CardErrorBoundaryProps {
	children: ReactNode;
	cardTitle: string;
	onRetry?: () => void;
}

export function CardErrorBoundary({
	children,
	cardTitle,
	onRetry,
}: CardErrorBoundaryProps) {
	return (
		<ErrorBoundary
			title={`${cardTitle} Error`}
			description={`Failed to load ${cardTitle.toLowerCase()}.`}
			onReset={onRetry}
		>
			{children}
		</ErrorBoundary>
	);
}

export function GlobalErrorFallback({ error, reset }: ErrorComponentProps) {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md border-destructive/50">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
						<AlertTriangle className="h-8 w-8 text-destructive" />
					</div>
					<CardTitle className="text-destructive">
						Application Error
					</CardTitle>
					<CardDescription>
						Something went wrong. Please try again or return to the dashboard.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{error && (
							<div className="rounded-md bg-muted p-3">
								<p className="font-mono text-sm text-muted-foreground break-words">
									{error.message}
								</p>
							</div>
						)}
						<div className="flex flex-col gap-2">
							<Button variant="outline" onClick={reset}>
								<RefreshCw className="mr-2 h-4 w-4" />
								Try again
							</Button>
							<a
								href="/"
								className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
							>
								<Home className="h-4 w-4" />
								Return to Dashboard
							</a>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
