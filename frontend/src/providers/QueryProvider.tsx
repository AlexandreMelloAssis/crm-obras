"use client";

import { PropsWithChildren, useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotifications } from "@/providers/NotificationProvider";
import { parseApiError } from "@/shared/utils/apiError";

export function QueryProvider({ children }: PropsWithChildren) {
  const { notify } = useNotifications();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 401) return;
            if (query.state.data !== undefined) return;

            notify({
              title: "Falha ao carregar dados",
              message: parseApiError(error, "Nao foi possivel carregar os dados da tela."),
              tone: "error",
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            console.error("Mutation error", error);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2,
            gcTime: 1000 * 60 * 10,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
