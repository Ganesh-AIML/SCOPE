/**
 * Normalizes department and branch names to "First-letter Capital" format.
 * Example: "ai&ml" -> "Ai&ml", "CIVIL" -> "Civil"
 */
exports.normalizeDept = (dept) => {
  if (!dept) return dept;
  // Trim edge whitespace and compress spaces around ampersands (e.g. "AI & ML" -> "ai&ml")
  const trimmed = dept.trim().replace(/\s*&\s*/g, '&').toLowerCase();
  if (trimmed.length === 0) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};