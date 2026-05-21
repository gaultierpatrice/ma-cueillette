import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-async-state',
  templateUrl: './async-state.html',
  styleUrl: './async-state.css',
})
export class AsyncStateComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() loadingMessage = 'Chargement...';
}
