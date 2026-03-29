"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDismissibleLayer = useDismissibleLayer;
const react_1 = require("react");
function useDismissibleLayer({ isOpen, containerRef, onDismiss, }) {
    (0, react_1.useEffect)(() => {
        if (!isOpen) {
            return;
        }
        function handlePointerDown(event) {
            if (!containerRef.current?.contains(event.target)) {
                onDismiss();
            }
        }
        function handleKeyDown(event) {
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
