const administrationRoot = "/studio-tianho";
const loginPath = `${administrationRoot}/login`;

export function safeAdministrationReturnPath(value: string | string[] | null | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || candidate.startsWith("//")) return administrationRoot;

  try {
    const url = new URL(candidate, "https://administration.local");
    const insideAdministration = url.pathname === administrationRoot
      || url.pathname.startsWith(`${administrationRoot}/`);
    if (url.origin !== "https://administration.local" || !insideAdministration || url.pathname === loginPath) {
      return administrationRoot;
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return administrationRoot;
  }
}

export function administrationLoginPath(returnPath: string | string[] | null | undefined) {
  const safeReturnPath = safeAdministrationReturnPath(returnPath);
  if (safeReturnPath === administrationRoot) return loginPath;
  return `${loginPath}?returnTo=${encodeURIComponent(safeReturnPath)}`;
}
