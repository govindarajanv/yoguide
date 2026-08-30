type Props = {
  /** 1 or 2 — number of practice blocks for the day */
  count: number
}

/**
 * Two stacked blocks (or a single block) in the style of the Noun Project
 * "two blocks" glyph. Fills currentColor so it inherits the title's color.
 */
export function BlocksIcon({ count }: Props) {
  return (
    <svg
      className="blocks-icon"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="26" height="12.5" rx="1.5" />
      {count >= 2 && <rect x="3" y="17" width="26" height="12.5" rx="1.5" />}
    </svg>
  )
}
