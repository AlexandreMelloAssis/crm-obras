"use client";

import { useCallback, useState } from "react";
import { NotificationTone, useNotifications } from "@/providers/NotificationProvider";

export type PageFeedback = {
  message: string;
  tone: NotificationTone;
};

export function usePageFeedback() {
  const [feedback, setFeedback] = useState<PageFeedback | null>(null);
  const { notify } = useNotifications();

  const showFeedback = useCallback(
    (message: string, tone: NotificationTone = "info", title?: string) => {
      const normalized = message.trim();
      if (!normalized) return;

      setFeedback({ message: normalized, tone });
      notify({ title, message: normalized, tone });
    },
    [notify]
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    feedback,
    showFeedback,
    clearFeedback,
  };
}
