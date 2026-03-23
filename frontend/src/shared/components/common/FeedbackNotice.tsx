"use client";

import type { PageFeedback } from "@/shared/hooks/usePageFeedback";

type FeedbackNoticeProps = {
  feedback: PageFeedback | null;
};

export function FeedbackNotice({ feedback }: FeedbackNoticeProps) {
  if (!feedback) return null;

  return (
    <div className={`feedback-notice feedback-${feedback.tone}`} role="status">
      {feedback.message}
    </div>
  );
}
