import { getSession, useSession } from 'next-auth/react';

/**
 * Force revalidation of the session to ensure UI is updated with latest data
 */
export async function revalidateSession() {
  // Force a session refresh
  await getSession({ force: true });
}

/**
 * Custom hook that extends useSession with refresh capability
 */
export function useSessionWithRefresh() {
  const sessionData = useSession();
  
  const refreshSession = async () => {
    await revalidateSession();
  };
  
  return {
    ...sessionData,
    refreshSession,
  };
}