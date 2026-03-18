import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';

interface Phase2CompletePayload {
  recipeId: string;
  isUnconfirmed: boolean;
}

type OnPhase2Complete = (payload: Phase2CompletePayload) => void;

/**
 * Subscribe to Supabase Realtime broadcast events for Phase 2 completion.
 *
 * The `onComplete` callback is held in a ref so that the Realtime subscription
 * is created only once per `userId` — not on every render that changes the
 * callback identity (which would cause a disconnect/reconnect loop).
 */
export function useRealtimePhase2(
  userId: string | null,
  onComplete: OnPhase2Complete
): void {
  // Always hold the latest callback without re-subscribing
  const onCompleteRef = useRef<OnPhase2Complete>(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user:${userId}`)
      .on(
        'broadcast',
        { event: 'phase2_complete' },
        ({ payload }: { payload: Phase2CompletePayload }) => {
          onCompleteRef.current(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]); // intentionally excludes onComplete — stabilized via ref
}

/**
 * Convenience hook: subscribe to Phase 2 completion and automatically
 * invalidate the recipes cache so screens refresh without manual pull-to-refresh.
 */
export function useRealtimePhase2WithInvalidation(
  userId: string | null
): void {
  const queryClient = useQueryClient();

  useRealtimePhase2(userId, ({ recipeId }) => {
    // Invalidate the specific recipe detail and the full list
    queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] });
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
  });
}
