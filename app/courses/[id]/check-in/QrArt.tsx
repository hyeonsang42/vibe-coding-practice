/**
 * QR 모양 그림 — 실제로 읽히는 코드가 아니다.
 * 시연 화면에서 "QR을 찍는다"는 상황을 보여주기 위한 장식이다.
 */

const SIZE = 21;

/** 문자열에서 같은 값이 나오는 난수 — 서버와 브라우저가 같은 그림을 그리게 한다. */
function seededRandom(seed: string): () => number {
  let value = 0;
  for (let i = 0; i < seed.length; i += 1) {
    value = (value * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

/** 모서리 3곳의 인식 표식 자리인지 */
function isFinderArea(row: number, col: number): boolean {
  const inBox = (r0: number, c0: number) =>
    row >= r0 && row < r0 + 8 && col >= c0 && col < c0 + 8;
  return inBox(0, 0) || inBox(0, SIZE - 8) || inBox(SIZE - 8, 0);
}

function isFinderModule(row: number, col: number): boolean {
  const inRing = (r0: number, c0: number) => {
    const r = row - r0;
    const c = col - c0;
    if (r < 0 || r > 6 || c < 0 || c > 6) return false;
    const edge = r === 0 || r === 6 || c === 0 || c === 6;
    const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
    return edge || core;
  };
  return inRing(0, 0) || inRing(0, SIZE - 7) || inRing(SIZE - 7, 0);
}

export function QrArt({ seed }: { seed: string }) {
  const random = seededRandom(seed);
  const modules: { row: number; col: number }[] = [];

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (isFinderModule(row, col)) {
        modules.push({ row, col });
      } else if (!isFinderArea(row, col) && random() > 0.55) {
        modules.push({ row, col });
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-full w-full"
      aria-hidden
      shapeRendering="crispEdges"
    >
      {modules.map(({ row, col }) => (
        <rect
          key={`${row}-${col}`}
          x={col}
          y={row}
          width={1}
          height={1}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
