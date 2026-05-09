export function getApiErrorMessage(error) {
  const payload = error?.response?.data;

  if (payload?.errors?.length) {
    return payload.errors.map((item) => item.message).join(", ");
  }

  return payload?.message || "Something went wrong. Please try again.";
}
