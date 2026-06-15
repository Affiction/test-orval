import { Component, inject, input } from '@angular/core';
import { DeleteTodoService } from '../api/delete-todo.service';

@Component({
  selector: 'app-delete-todo-button',
  standalone: true,
  template: `
    <button
      (click)="deleteTodo.delete(todoId())"
      class="px-2.5 py-1 bg-red-500 text-white border-none rounded cursor-pointer text-xs"
    >
      Delete
    </button>
  `,
})
export class DeleteTodoButtonComponent {
  todoId = input.required<number>();
  protected deleteTodo = inject(DeleteTodoService);
}
