"use client";

import { useEffect, type RefObject } from "react";

type UseDismissibleLayerProps = {
  isOpen: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
};

export function useDismissibleLayer({
  isOpen,
  containerRef,
  onDismiss,
}: UseDismissibleLayerProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onDismiss();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, isOpen, onDismiss]);
}
