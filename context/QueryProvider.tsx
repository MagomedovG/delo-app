import { QueryClient } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // gcTime: 1000 * 60 * 20, // 20 минут
        gcTime: 1000 * 10, // 20 минут
        refetchOnWindowFocus: false, 
      },
    },
  });
  
  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

export default function QueryProvider({ children }: PropsWithChildren) {
    return <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>{children}</PersistQueryClientProvider>;
}



