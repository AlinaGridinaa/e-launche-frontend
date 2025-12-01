/**
 * Converts avatar URL to absolute URL with backend domain
 * @param avatarUrl - Avatar URL from database (can be relative or absolute)
 * @returns Full URL to avatar image
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    return '/images/default-avatar.png';
  }

  // If already absolute URL (starts with http or https), return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // If relative URL, prepend with API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${apiUrl}${avatarUrl}`;
}
