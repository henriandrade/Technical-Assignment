import { memo } from "react";

type Props = {
  width: number;
  height: number;
  columns: Array<{ x: number; width: number }>;
  shelves: Array<{ y: number }>;
};

function FrontViewSVGImpl({ width, height, columns, shelves }: Props) {
  const W = 300;
  const H = 220;
  const sx = (x: number) => (x / width) * W;
  const sy = (y: number) => H - (y / height) * H;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect x={0} y={0} width={W} height={H} fill="#fff" stroke="#d4d4d8" />
      {columns.map((c, i) => (
        <rect
          key={`c-${i}`}
          x={sx(c.x)}
          y={0}
          width={sx(c.width)}
          height={H}
          fill="#e5e7eb"
        />
      ))}
      {shelves.map((s, i) => (
        <line
          key={`s-${i}`}
          x1={0}
          x2={W}
          y1={sy(s.y)}
          y2={sy(s.y)}
          stroke="#9ca3af"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

export const FrontViewSVG = memo(FrontViewSVGImpl);

