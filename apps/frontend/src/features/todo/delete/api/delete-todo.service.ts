import { inject, Injectable } from '@angular/core';
import { DefaultService } from '@shared/api';
import { TodoStore } from '@entities/todo';

@Injectable({ providedIn: 'root' })
export class DeleteTodoService {
  private api = inject(DefaultService);
  private store = inject(TodoStore);

  delete(id: number) {
    this.api.deleteTodosId(String(id)).subscribe(() => this.store.load());
  }
}
