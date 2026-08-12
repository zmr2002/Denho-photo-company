"use client";

import { useCallback, useState } from "react";

type Feedback = { kind: "success" | "error"; message: string } | null;

export function useAdministrationAction() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const showSuccess = useCallback((message: string) => setFeedback({ kind: "success", message }), []);
  const showError = useCallback((message: string) => setFeedback({ kind: "error", message }), []);

  const run = useCallback(async (operation: () => Promise<void>) => {
    setPending(true);
    setFeedback(null);
    try {
      await operation();
    } catch {
      setFeedback({ kind: "error", message: "操作没有完成，请检查连接后重试。" });
    } finally {
      setPending(false);
    }
  }, []);

  return { feedback, pending, run, showError, showSuccess };
}

export function AdminActionFeedback({ feedback, className = "" }: { feedback: Feedback; className?: string }) {
  return (
    <p
      className={`admin-action-feedback ${feedback ? `admin-action-feedback-${feedback.kind}` : ""} ${className}`.trim()}
      role={feedback?.kind === "error" ? "alert" : "status"}
    >
      {feedback?.message || ""}
    </p>
  );
}
