import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from 'lucide-react';
import * as React from 'react';

import type { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';
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

type PaginationCollection = Pick<
    PaginatedData<unknown>,
    'current_page' | 'last_page' | 'links'
>;

type PaginationsProps = {
    pagination: PaginationCollection;
    replace?: boolean;
    preserveScroll?: boolean;
    onNavigateStart?: () => void;
    onNavigateFinish?: () => void;
};

type PaginationItemToken = number | 'ellipsis-left' | 'ellipsis-right';

function resolvePaginationTokens(
    currentPage: number,
    lastPage: number,
): PaginationItemToken[] {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(lastPage - 1, currentPage + 1);

    if (currentPage <= 4) {
        startPage = 2;
        endPage = 5;
    }

    if (currentPage >= lastPage - 3) {
        startPage = Math.max(2, lastPage - 4);
        endPage = lastPage - 1;
    }

    const tokens: PaginationItemToken[] = [1];

    if (startPage > 2) {
        tokens.push('ellipsis-left');
    }

    for (let page = startPage; page <= endPage; page += 1) {
        tokens.push(page);
    }

    if (endPage < lastPage - 1) {
        tokens.push('ellipsis-right');
    }

    tokens.push(lastPage);

    return tokens;
}

export const Paginations = ({
    pagination,
    replace = true,
    preserveScroll = true,
    onNavigateStart,
    onNavigateFinish,
}: PaginationsProps) => {
    const paginationTokens = resolvePaginationTokens(
        pagination.current_page,
        pagination.last_page,
    );

    const handlePageChange = (page: number) => {
        const link = pagination.links.find((l) => l.label === String(page));
        if (link?.url) {
            router.visit(link.url, {
                replace,
                preserveScroll,
                onStart: onNavigateStart,
                onFinish: onNavigateFinish,
            });
        }
    };

    if (pagination.last_page <= 1) {
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
                            if (pagination.current_page > 1) {
                                handlePageChange(pagination.current_page - 1);
                            }
                        }}
                        className={
                            pagination.current_page === 1
                                ? 'pointer-events-none opacity-50'
                                : ''
                        }
                    />
                </PaginationItem>
                {paginationTokens.map((token) => {
                    if (
                        token === 'ellipsis-left' ||
                        token === 'ellipsis-right'
                    ) {
                        return <PaginationEllipsis key={token} />;
                    }

                    return (
                        <PaginationItem key={token}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(token);
                                }}
                                isActive={token === pagination.current_page}
                            >
                                {token}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (
                                pagination.current_page < pagination.last_page
                            ) {
                                handlePageChange(pagination.current_page + 1);
                            }
                        }}
                        className={
                            pagination.current_page === pagination.last_page
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
