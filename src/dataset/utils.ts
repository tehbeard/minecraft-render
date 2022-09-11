/**
 * Validates the format of a resource location
 * @param location resource location in formation namespace:path/to/item
 */
export function validateResourceLocation(location: string) {
  if (!/[0-9a-z_\-\.]+:[0-9a-z_\-\.\/]+/.test(location)) {
    throw new Error(`"${location}" is not a valid resource location.`);
  }
}

export function constructPath(
  objectType: string,
  suffix: string,
  namespace: string,
  identifier?: string
): string {
  try {
    if (identifier == undefined) {
      validateResourceLocation(namespace);
      [namespace, identifier] = namespace.split(":", 2);
    } else {
      validateResourceLocation(namespace + ":" + identifier);
    }
  } catch (e) {
    throw new Error("Failed to construct path", { cause: e });
  }

  return `${namespace}/${objectType}/${identifier}.${suffix}`;
}
