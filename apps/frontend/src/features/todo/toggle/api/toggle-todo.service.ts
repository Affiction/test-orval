import { inject, Injectable } from '@angular/core';
import { DefaultService } from '@shared/api';
import { TodoStore } from '@entities/todo';

@Injectable({ providedIn: 'root' })
export class ToggleTodoService {
  private api = inject(DefaultService);
  private store = inject(TodoStore);

  toggle(id: number, done: boolean) {
    this.api.patchTodosId(String(id), { done }).subscribe(() => this.store.load());
  }
}
