import { useState, useCallback, useMemo } from 'react';

interface UseTableFilterOptions {
    initialPage?: number;
    initialPerPage?: number;
    initialSearch?: string;
    initialSort?: string;
    initialOrder?: 'asc' | 'desc';
}

interface FilterState {
    page: number;
    perPage: number;
    search: string;
    sort: string;
    order: 'asc' | 'desc';
    filters: Record<string, string>;
}

export function useTableFilter(options: UseTableFilterOptions = {}) {
    const {
        initialPage = 1,
        initialPerPage = 10,
        initialSearch = '',
        initialSort = 'created_at',
        initialOrder = 'desc',
    } = options;

    const [state, setState] = useState<FilterState>({
        page: initialPage,
        perPage: initialPerPage,
        search: initialSearch,
        sort: initialSort,
        order: initialOrder,
        filters: {},
    });

    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

    // Debounce search (300ms)
    const handleSearchChange = useCallback((value: string) => {
        setState((prev) => ({
            ...prev,
            search: value,
            page: 1, // Reset to first page on search
        }));

        // Debounce
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setState((prev) => ({
            ...prev,
            page,
        }));
    }, []);

    const handlePerPageChange = useCallback((perPage: number) => {
        setState((prev) => ({
            ...prev,
            perPage,
            page: 1, // Reset to first page
        }));
    }, []);

    const handleSort = useCallback((field: string) => {
        setState((prev) => ({
            ...prev,
            sort: field,
            order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const handleFilterChange = useCallback((key: string, value: string) => {
        setState((prev) => ({
            ...prev,
            filters: {
                ...prev.filters,
                [key]: value,
            },
            page: 1, // Reset to first page
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setState({
            page: initialPage,
            perPage: initialPerPage,
            search: initialSearch,
            sort: initialSort,
            order: initialOrder,
            filters: {},
        });
        setDebouncedSearch(initialSearch);
    }, [initialPage, initialPerPage, initialSearch, initialSort, initialOrder]);

    // Build query params
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();

        if (state.search) params.set('search', state.search);
        if (state.sort) params.set('sort', state.sort);
        if (state.order) params.set('order', state.order);
        if (state.perPage !== initialPerPage)
            params.set('per_page', String(state.perPage));

        Object.entries(state.filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        return params.toString();
    }, [state, initialPerPage]);

    return {
        // State
        page: state.page,
        perPage: state.perPage,
        search: state.search,
        debouncedSearch,
        sort: state.sort,
        order: state.order,
        filters: state.filters,

        // Actions
        setSearch: handleSearchChange,
        onPageChange: handlePageChange,
        onPerPageChange: handlePerPageChange,
        onSort: handleSort,
        onFilterChange: handleFilterChange,
        resetFilters,

        // Computed
        queryParams,
    };
}
