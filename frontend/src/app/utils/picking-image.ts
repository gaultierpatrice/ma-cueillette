export const DEFAULT_PICKING_IMAGE_URL = '/assets/images/illustration/strawberry.jpg';

export const PICKING_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

export const PICKING_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Returns an error message, or null if the file is valid. */
export function validatePickingImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Formats acceptés : JPEG, PNG ou WebP.';
  }
  if (file.size > PICKING_IMAGE_MAX_BYTES) {
    return "L'image ne doit pas dépasser 5 Mo.";
  }
  return null;
}

export function resolvePickingImageUrl(imageUrl?: string | null, cacheBust?: string | number): string {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return DEFAULT_PICKING_IMAGE_URL;
  }
  if (trimmed.startsWith('/api/')) {
    return cacheBust != null ? `${trimmed}?v=${cacheBust}` : trimmed;
  }
  return trimmed;
}
