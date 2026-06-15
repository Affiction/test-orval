import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-delete-todo-button',
  standalone: true,
  template: `
    <button
      (click)="clicked.emit(todoId())"
      style="padding: 4px 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
    >
      Delete
    </button>
  `,
})
export class DeleteTodoButtonComponent {
  todoId = input.required<number>();
  clicked = output<number>();
}
