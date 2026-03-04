import { EventBadge } from '@/components/activity-logs/event-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { UserLog } from '@/types';

type LogTableProps = {
    logs: UserLog[];
    isLoading: boolean;
    showUser: boolean;
};

const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
});

function formatTimestamp(value: string): string {
    return formatter.format(new Date(value));
}

export function LogTable({ logs, isLoading, showUser }: LogTableProps) {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        {showUser && <TableHead>User</TableHead>}
                        <TableHead>Event</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Session</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <>
                            <TableRow>
                                <TableCell colSpan={showUser ? 6 : 5}>
                                    <Skeleton className="h-5 w-full" />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={showUser ? 6 : 5}>
                                    <Skeleton className="h-5 w-full" />
                                </TableCell>
                            </TableRow>
                        </>
                    )}
                    {!isLoading && logs.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={showUser ? 6 : 5}
                                className="text-muted-foreground py-8 text-center"
                            >
                                No activity logs found for the selected filters.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading &&
                        logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{formatTimestamp(log.created_at)}</TableCell>
                                {showUser && (
                                    <TableCell className="align-top">
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {log.user?.name ?? `User #${log.user_id}`}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {log.user?.email ?? '-'}
                                            </span>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell>
                                    <EventBadge eventType={log.event_type} />
                                </TableCell>
                                <TableCell>{log.ip_address ?? '-'}</TableCell>
                                <TableCell>{log.device_info ?? 'Unknown'}</TableCell>
                                <TableCell className="font-mono text-xs">
                                    {log.session_id ?? '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
