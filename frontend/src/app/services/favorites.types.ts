export type FavoriteActionResult =
  | { status: 'login_required' }
  | { status: 'toggled'; isFavorite: boolean }
  | { status: 'removed' }
  | { status: 'error'; message: string };

export const FAVORITE_LOGIN_MESSAGE = 'Veuillez vous connecter pour ajouter des favoris';

export const FAVORITE_ADD_ERROR_MESSAGE = "Erreur lors de l'ajout du favori";

export const FAVORITE_REMOVE_ERROR_MESSAGE = 'Erreur lors de la suppression du favori';

export const FAVORITE_LOAD_ERROR_MESSAGE = 'Erreur lors du chargement de vos favoris';

export function getFavoriteModalMessage(result: FavoriteActionResult): string | null {
  if (result.status === 'login_required') {
    return FAVORITE_LOGIN_MESSAGE;
  }

  if (result.status === 'error') {
    return result.message;
  }

  return null;
}
