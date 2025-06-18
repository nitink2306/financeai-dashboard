"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId?: string;
  merchant?: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTransaction: (data: any) => Promise<Transaction>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useTransactions(initialLimit = 50): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [limit] = useState(initialLimit);
  const [offset, setOffset] = useState(0);

  // Prevent multiple simultaneous requests
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTransactions = useCallback(
    async (reset = false) => {
      // Prevent duplicate requests
      if (fetchingRef.current) return;

      try {
        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        // Cancel previous request if it exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        const currentOffset = reset ? 0 : offset;
        const response = await fetch(
          `/api/transactions?limit=${limit}&offset=${currentOffset}`,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              "Cache-Control": "max-age=60", // 1 minute cache for transactions
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch transactions: ${response.status} ${response.statusText}`
          );
        }

        const data: Transaction[] = await response.json();

        if (reset) {
          setTransactions(data);
          setOffset(data.length);
        } else {
          setTransactions((prev) => [...prev, ...data]);
          setOffset((prev) => prev + data.length);
        }

        // Check if we have more data
        setHasMore(data.length === limit);

        console.log(
          `✅ Fetched ${data.length} transactions (offset: ${currentOffset})`
        );
      } catch (err) {
        // Don't set error for aborted requests
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Request aborted");
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch transactions";
        setError(errorMessage);
        console.error("Transaction fetch error:", err);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [limit, offset]
  );

  const refetch = useCallback(async () => {
    setOffset(0);
    await fetchTransactions(true);
  }, [fetchTransactions]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchTransactions(false);
  }, [fetchTransactions, hasMore, loading]);

  const addTransaction = useCallback(
    async (transactionData: any): Promise<Transaction> => {
      try {
        setError(null);

        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to add transaction: ${response.status}`
          );
        }

        const newTransaction: Transaction = await response.json();

        // Add to the beginning of the list (most recent first)
        setTransactions((prev) => [newTransaction, ...prev]);

        console.log(`✅ Transaction added: ${newTransaction.id}`);
        return newTransaction;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add transaction";
        setError(errorMessage);
        console.error("Add transaction error:", err);
        throw err;
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchTransactions(true);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTransactions]);

  // Auto-refresh every 5 minutes when tab is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    const interval = setInterval(() => {
      if (!document.hidden) {
        refetch();
      }
    }, 5 * 60 * 1000); // 5 minutes

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  return {
    transactions,
    loading,
    error,
    refetch,
    addTransaction,
    hasMore,
    loadMore,
  };
}
