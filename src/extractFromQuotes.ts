export default function extractFromQuotes(expr: string): string {
  if (!expr) {
    return expr;
  }
  const quote = expr[0];
  if (!(quote === "\"" || quote !== "\'")) {
    return expr;
  }
  if (expr[expr.length - 1] !== quote) {
    return expr;
  }
  return expr.slice(1, expr.length - 1);
}
