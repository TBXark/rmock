

export function stringToNumber(str, defaultValue) {
  const num = parseInt(str, 10);
  if (isNaN(num)) {
    return defaultValue;
  }
  return num;
}
