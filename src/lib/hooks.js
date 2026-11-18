"use client";
import { useCallback, useEffect, useState } from "react";

// Loads data with loading + error state. Call reload() after a successful POST.
export function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: "", loading: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      setState({ data: await fn(), error: "", loading: false });
    } catch (e) {
      setState({ data: null, error: e.message, loading: false });
    }
  }, deps);
  useEffect(() => {
    run();
  }, [run]);
  return { ...state, reload: run };
}
