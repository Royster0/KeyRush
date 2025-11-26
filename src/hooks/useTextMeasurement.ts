import { RefObject, useCallback } from "react";

export const useTextMeasurement = (
  containerRef: RefObject<HTMLDivElement | null>
) => {
  return useCallback(
    (text: string): string[] => {
      const container = containerRef.current;
      if (!container) {
        return [];
      }

      const temp = document.createElement("div");
      Object.assign(temp.style, {
        visibility: "hidden",
        position: "absolute",
        whiteSpace: "pre",
        fontSize: "1.875rem",
        fontFamily: "monospace",
      });

      container.appendChild(temp);
      const maxWidth = container.clientWidth - 48;

      const lines: string[] = [];
      let currentLine = "";
      text.split(" ").forEach((word) => {
        temp.textContent = currentLine + (currentLine ? " " : "") + word;
        if (temp.offsetWidth <= maxWidth) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word);
            currentLine = "";
          }
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }
      container.removeChild(temp);

      return lines;
    },
    [containerRef]
  );
};
