import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFunction, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [execute, autoFetch]);

  return { data, loading, error, refetch: execute };
};