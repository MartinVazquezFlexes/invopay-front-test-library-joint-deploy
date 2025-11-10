export const getVar = (variableName: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
