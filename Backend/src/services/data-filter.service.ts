/**
 * Data Filtering Service for Backend
 * Ensures that users can only access their own data by filtering based on authenticated user_id
 */

export interface DataResource {
  id: string;
  user_id?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Filters a collection of resources to only those belonging to the authenticated user
 */
export function filterUserData<T extends DataResource>(
  resources: T[],
  authenticatedUserId: string
): T[] {
  return resources.filter(resource => {
    // Check for both snake_case and camelCase user ID fields
    return resource.user_id === authenticatedUserId ||
           resource.userId === authenticatedUserId;
  });
}

/**
 * Checks if a user can access a specific resource
 */
export function canUserAccessResource(
  authenticatedUserId: string,
  resource: DataResource
): boolean {
  // Check for both snake_case and camelCase user ID fields
  return resource.user_id === authenticatedUserId ||
         resource.userId === authenticatedUserId;
}

/**
 * Modifies a resource to include the authenticated user's ID
 */
export function assignUserToResource<T extends Partial<DataResource>>(
  resource: T,
  authenticatedUserId: string
): T {
  return {
    ...resource,
    user_id: authenticatedUserId
  };
}

/**
 * Validates that a request is attempting to access only the user's own data
 */
export function validateUserAccess(
  authenticatedUserId: string,
  requestedUserId?: string
): boolean {
  // If no specific user is requested, assume it's for the authenticated user
  if (!requestedUserId) {
    return true;
  }

  // If a specific user is requested, it must match the authenticated user
  return authenticatedUserId === requestedUserId;
}

/**
 * Applies user-based filtering to a database query object
 */
export function addUserFilterToQuery(
  queryObject: any,
  authenticatedUserId: string,
  fieldName: string = 'user_id'
): any {
  return {
    ...queryObject,
    [fieldName]: authenticatedUserId
  };
}

/**
 * Removes sensitive fields from resources before sending to client
 */
export function sanitizeResourceForClient<T extends DataResource>(resource: T): Omit<T, 'user_id' | 'userId'> {
  const { user_id, userId, ...sanitizedResource } = resource as any;
  return sanitizedResource;
}

/**
 * Sanitizes a collection of resources for client response
 */
export function sanitizeResourcesForClient<T extends DataResource>(resources: T[]): Omit<T, 'user_id' | 'userId'>[] {
  return resources.map(resource => sanitizeResourceForClient(resource));
}