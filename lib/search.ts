/**
 * Helpers for building PostgREST `or=(...)` filters from free-text the dancer
 * typed into the search box.
 *
 * Two separate escaping layers have to be applied, in order:
 *
 *  1. ILIKE pattern escaping — `%` and `_` are wildcards in SQL LIKE/ILIKE, so
 *     a search for "100%" would otherwise match anything starting with "100".
 *     Postgres treats backslash as the default escape character.
 *
 *  2. PostgREST value quoting — the `or` filter is a single comma-separated
 *     string, so a value containing a comma, parenthesis or dot silently splits
 *     into extra conditions (or throws a parse error). Wrapping the value in
 *     double quotes fixes that, which in turn means `"` and `\` inside the value
 *     need backslash-escaping.
 */

/** Escapes SQL LIKE/ILIKE wildcards so the term matches literally. */
function escapeLikePattern(term: string): string {
  return term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/** Escapes a value for use inside a double-quoted PostgREST filter value. */
function quotePostgrestValue(value: string): string {
  return `"${value.replace(/["\\]/g, (ch) => `\\${ch}`)}"`;
}

/**
 * Builds the argument for `.or()` matching `term` as a substring of any of
 * `columns`. Returns e.g. `title.ilike."%tatkar%",bols.ilike."%tatkar%"`.
 */
export function buildIlikeOrFilter(columns: string[], term: string): string {
  const pattern = quotePostgrestValue(`%${escapeLikePattern(term)}%`);
  return columns.map((col) => `${col}.ilike.${pattern}`).join(",");
}
