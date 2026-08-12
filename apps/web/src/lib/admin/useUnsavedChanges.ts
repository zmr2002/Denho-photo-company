"use client";

import { useEffect } from "react";

const defaultMessage = "还有未保存的修改，确定要离开当前页面吗？";

export function useUnsavedChanges(when: boolean, message = defaultMessage) {
  useEffect(() => {
    if (!when) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = message;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      const sameDocumentHash = url.hash && url.pathname === window.location.pathname && url.search === window.location.search;
      if (url.origin !== window.location.origin || url.href === window.location.href || sameDocumentHash) return;
      if (window.confirm(message)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [message, when]);
}
