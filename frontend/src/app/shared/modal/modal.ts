import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalButton, ModalButtonVariant } from './modal.types';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() message = '';
  @Input() closeOnOverlay = true;
  @Input() splitButtons = false;
  @Input() buttons: ModalButton[] = [{ label: 'OK', variant: 'primary' }];

  @Output() closed = new EventEmitter<void>();
  @Output() buttonClick = new EventEmitter<number>();

  onOverlayClick(): void {
    if (this.closeOnOverlay) {
      this.closed.emit();
    }
  }

  onButtonClick(index: number): void {
    this.buttonClick.emit(index);
  }

  buttonClass(variant: ModalButtonVariant = 'primary'): string {
    switch (variant) {
      case 'cancel':
        return 'btn-cancel';
      case 'secondary':
        return 'btn-secondary';
      default:
        return 'btn-confirm';
    }
  }
}
