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
export function useHasPoap(address: string, eventId: number) {
  const { data, error } = useSWR(`/api/poap/scan/${address}/${eventId}`, fetcher);

  return {
    hasPoap: data?.statusCode !== 404,
    data,
    isLoading: !error && !data,
    isError: error,
  };
}
export function useGetEventPoaps(eventId: number) {
  const { data, error } = useSWR(`/api/poap/event/${eventId}/poaps`, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useGetEvent(eventId: number) {
  const { data, error } = useSWR(`/api/poap/event/${eventId}`, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
}
