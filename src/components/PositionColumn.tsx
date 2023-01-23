export const COL_WIDTHS = {
  1: 16,
  2: 10,
  3: 18,
  4: 13,
  5: 11,
  6: 15,
  7: 17,
} as const;

export function PositionColumn(props: {
  children: React.ReactNode;
  num: keyof typeof COL_WIDTHS;
}) {
  return (
    <div style={{ width: `${COL_WIDTHS[props.num]}%` }}>{props.children}</div>
  );
}
