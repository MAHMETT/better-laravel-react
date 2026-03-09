import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log to error reporting service in production
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    override render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-screen items-center justify-center bg-background p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <AlertCircle className="mx-auto size-12 text-destructive" />
                            <CardTitle className="mt-4">
                                Something went wrong
                            </CardTitle>
                            <CardDescription>
                                {this.state.error?.message ||
                                    'An unexpected error occurred'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Button
                                onClick={() => {
                                    this.setState({
                                        hasError: false,
                                        error: null,
                                    });
                                    window.location.href =
                                        window.location.pathname;
                                }}
                                className="w-full"
                            >
                                Reload Page
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    window.history.back();
                                }}
                                className="w-full"
                            >
                                Go Back
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
