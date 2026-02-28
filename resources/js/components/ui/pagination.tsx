import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from 'lucide-react';
import * as React from 'react';

import type { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserPagination } from '@/types';
import { router } from '@inertiajs/react';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    );
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn('flex flex-row items-center gap-1', className)}
            {...props}
        />
    );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
    React.ComponentProps<'a'>;

function PaginationLink({
    className,
    isActive,
    size = 'icon',
    ...props
}: PaginationLinkProps) {
    return (
        <a
            aria-current={isActive ? 'page' : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                buttonVariants({
                    variant: isActive ? 'outline' : 'ghost',
                    size,
                }),
                className,
            )}
            {...props}
        />
    );
}

function PaginationPrevious({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
            {...props}
        >
            <ChevronLeftIcon />
            <span className="hidden sm:block">Previous</span>
        </PaginationLink>
    );
}

function PaginationNext({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
            {...props}
        >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon />
        </PaginationLink>
    );
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn('flex size-9 items-center justify-center', className)}
            {...props}
        >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">More pages</span>
        </span>
    );
}

export const Paginations = ({ users }: UserPagination) => {
    const handlePageChange = (page: number) => {
        const link = users.links.find((l) => l.label === String(page));
        if (link?.url) {
            router.visit(link.url, { replace: true });
        }
    };

    if (users.last_page <= 1) {
        return null;
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (users.current_page > 1) {
                                handlePageChange(users.current_page - 1);
                            }
                        }}
                        className={
                            users.current_page === 1
                                ? 'pointer-events-none opacity-50'
                                : ''
                        }
                    />
                </PaginationItem>
                {Array.from({ length: users.last_page }, (_, i) => i + 1).map(
                    (page) => {
                        const showPage =
                            page === 1 ||
                            page === users.last_page ||
                            Math.abs(page - users.current_page) <= 1;

                        const showEllipsisBefore =
                            page === users.current_page - 2 && page > 2;
                        const showEllipsisAfter =
                            page === users.current_page + 2 &&
                            page < users.last_page - 1;

                        if (
                            !showPage &&
                            !showEllipsisBefore &&
                            !showEllipsisAfter
                        ) {
                            return null;
                        }

                        if (showEllipsisBefore || showEllipsisAfter) {
                            return (
                                <PaginationEllipsis key={`ellipsis-${page}`} />
                            );
                        }

                        return (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page);
                                    }}
                                    isActive={page === users.current_page}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    },
                )}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (users.current_page < users.last_page) {
                                handlePageChange(users.current_page + 1);
                            }
                        }}
                        className={
                            users.current_page === users.last_page
                                ? 'pointer-events-none opacity-50'
                                : ''
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};
