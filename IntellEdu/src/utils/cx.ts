/**
 * Typed ClassNames helper to concatenate dynamic Tailwind CSS class strings
 */
export function cx(...classes: Array<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(' ').trim();
}

export default cx;

