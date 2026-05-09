export function formatDate(value) {
  if (!value) return "No due date";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatStatusLabel(status) {
  return status.replace("-", " ");
}
