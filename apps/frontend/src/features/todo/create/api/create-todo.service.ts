import { inject, Injectable } from '@angular/core';
import { DefaultService } from '@shared/api';
import { TodoStore } from '@entities/todo';

@Injectable({ providedIn: 'root' })
export class CreateTodoService {
  private api = inject(DefaultService);
  private store = inject(TodoStore);

  create(title: string) {
    this.api.postTodos({ title }).subscribe(() => this.store.load());
  }
}
