import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  step?: number; // drag and keyboard increment
  dragPerPixel?: number; // how much value changes per pixel dragged
  min?: number;
  max?: number;
  suffix?: string;
  precision?: number; // decimals shown
  title?: string;
};

export function DraggableInput({
  label,
  value,
  onChange,
  step = 0.01,
  dragPerPixel,
  min = -Infinity,
  max = Infinity,
  suffix = "",
  precision = 2,
  title,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(String(value));
  const dragStartX = useRef<number | null>(null);
  const startValue = useRef<number>(value);
  const restoreUserSelect = useRef<string>("");

  const clamp = useCallback(
    (v: number) => Math.max(min, Math.min(max, v)),
    [min, max]
  );

  const commitDraft = useCallback(() => {
    const parsed = Number(draft);
    if (!Number.isNaN(parsed)) onChange(clamp(parsed));
    setIsEditing(false);
  }, [draft, onChange, clamp]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isEditing) return;
      e.preventDefault();
      dragStartX.current = e.clientX;
      startValue.current = value;
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      document.body.style.cursor = "ew-resize";
      restoreUserSelect.current = document.body.style.userSelect;
      document.body.style.userSelect = "none";
    },
    [value, isEditing]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragStartX.current == null) return;
      e.preventDefault();
      const dx = e.clientX - dragStartX.current;
      const factor = dragPerPixel ?? step;
      const delta = dx * factor; // pixels * factor
      onChange(clamp(startValue.current + delta));
    },
    [onChange, clamp, step, dragPerPixel]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = null;
    document.body.style.cursor = "auto";
    document.body.style.userSelect = restoreUserSelect.current || "";
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commitDraft();
      if (e.key === "Escape") {
        setDraft(String(value));
        setIsEditing(false);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onChange(clamp(value + step));
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onChange(clamp(value - step));
      }
    },
    [commitDraft, value, onChange, clamp, step]
  );

  const displayValue = useMemo(
    () => `${value.toFixed(precision)}${suffix}`,
    [value, suffix, precision]
  );

  // Numeric value matching the displayed text (rounded to precision)
  const displayNumeric = useMemo(
    () => Number(value.toFixed(precision)),
    [value, precision]
  );

  // Sync draft when external value changes (outside of render to avoid loops)
  useEffect(() => {
    if (!isEditing) setDraft(String(value));
  }, [value, isEditing]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: label ? "1fr auto" : "auto",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.875rem",
      }}
    >
      {label && <div style={{ color: "#475569" }}>{label}</div>}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => {
          setDraft(String(value));
          setIsEditing(true);
        }}
        style={{
          minWidth: "6rem",
          padding: "0.375rem 0.5rem",
          borderRadius: "0.375rem",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
          cursor: isEditing ? "text" : "ew-resize",
          color: "#0f172a",
          userSelect: isEditing ? "text" : "none",
          position: "relative",
        }}
        title={title ?? "Drag horizontally to change. Double click to type."}
      >
        {isEditing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={onKeyDown}
            style={{
              width: "100%",
              outline: "none",
              background: "transparent",
              border: "none",
              font: "inherit",
              color: "inherit",
              textAlign: "right",
            }}
            inputMode="decimal"
          />
        ) : (
          <div style={{ textAlign: "right" }}>{displayValue}</div>
        )}
        {
          // Show visual slider track only when bounds are valid
          (() => {
            const hasBounds =
              Number.isFinite(min) && Number.isFinite(max) && max > min;
            if (!hasBounds) return null;
            const draftNum = Number(draft);
            const baseValue =
              isEditing && !Number.isNaN(draftNum) ? draftNum : displayNumeric;
            const norm = Math.max(
              0,
              Math.min(1, (baseValue - min) / (max - min))
            );
            return (
              <div
                style={{
                  position: "absolute",
                  left: "0.5rem",
                  right: "0.5rem",
                  bottom: "1px",
                  height: "1px",
                  background: "#cbd5e1",
                  borderRadius: "0.5px",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${norm * 100}%`,
                    transform: "translateX(-50%)",
                    top: "-2px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#475569",
                    border: "1px solid #f8fafc",
                    pointerEvents: "none",
                  }}
                />
              </div>
            );
          })()
        }
      </div>
    </div>
  );
}
