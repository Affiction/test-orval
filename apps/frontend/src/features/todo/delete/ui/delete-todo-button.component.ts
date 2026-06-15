import { Component, inject, input } from '@angular/core';
import { DeleteTodoService } from '../api/delete-todo.service';

@Component({
  selector: 'app-delete-todo-button',
  standalone: true,
  templateUrl: './delete-todo-button.component.html',
})
export class DeleteTodoButtonComponent {
  todoId = input.required<number>();
  protected deleteTodo = inject(DeleteTodoService);
}
