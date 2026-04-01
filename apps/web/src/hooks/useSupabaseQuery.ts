import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface UseSupabaseQueryOptions {
  table: string;
  select?: string;
  filters?: Record<string, unknown>;
  order?: { column: string; ascending?: boolean };
  enabled?: boolean;
}

export function useSupabaseQuery<T>({ table, select = "*", filters, order, enabled = true }: UseSupabaseQueryOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    let query = supabase.from(table).select(select);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query = query.eq(key, value);
        }
      });
    }

    if (order) {
      query = query.order(order.column, { ascending: order.ascending ?? false });
    }

    const { data: result, error: err } = await query;

    if (err) setError(err.message);
    else setData((result as T[]) || []);
    setLoading(false);
  }, [table, select, JSON.stringify(filters), order?.column, order?.ascending, enabled]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useSupabaseRecord<T>(table: string, id: string | undefined, select = "*") {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: result, error: err } = await supabase
      .from(table)
      .select(select)
      .eq("id", id)
      .single();

    if (err) setError(err.message);
    else setData(result as T);
    setLoading(false);
  }, [table, id, select]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
