import { inject, Injectable, signal } from '@angular/core';
import { DefaultService, Todo } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private api = inject(DefaultService);

  todos = signal<Todo[]>([]);

  load() {
    this.api.getTodos().subscribe((todos) => this.todos.set(todos));
  }
}
