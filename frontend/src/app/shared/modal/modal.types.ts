export type ModalButtonVariant = 'primary' | 'secondary' | 'cancel';

export interface ModalButton {
  label: string;
  variant?: ModalButtonVariant;
}
