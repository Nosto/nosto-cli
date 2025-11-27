export function isValidAlphaNumeric(input: unknown) {
  if (typeof input !== "string") {
    return false
  }
  const regex = /^[A-Za-z0-9\s\-_.!,?]{1,200}$/

  return regex.test(input)
}
