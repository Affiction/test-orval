import { Component, inject } from '@angular/core';
import { TodoStore, TodoCardComponent } from '@entities/todo';
import { DeleteTodoButtonComponent, ToggleTodoCheckboxComponent } from '@features/todo';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [TodoCardComponent, DeleteTodoButtonComponent, ToggleTodoCheckboxComponent],
  template: `
    @if (store.todos().length === 0) {
      <p class="text-gray-400 text-center mt-8">No todos yet.</p>
    }
    @for (todo of store.todos(); track todo.id) {
      <div class="flex items-center justify-between py-2.5 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <app-toggle-todo-checkbox [todoId]="todo.id" [done]="todo.done" />
          <app-todo-card [todo]="todo" />
        </div>
        <app-delete-todo-button [todoId]="todo.id" />
      </div>
    }
  `,
})
export class TodoListComponent {
  protected store = inject(TodoStore);
}
