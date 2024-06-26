import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function usePoaps(address: string, limit?: number) {
  const { data, error } = useSWR(`/api/poap/scan/${address}?limit=${limit || 0}`, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
}
