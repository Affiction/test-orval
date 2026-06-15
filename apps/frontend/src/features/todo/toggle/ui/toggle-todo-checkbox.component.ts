import { Component, inject, input } from '@angular/core';
import { ToggleTodoService } from '../api/toggle-todo.service';

@Component({
  selector: 'app-toggle-todo-checkbox',
  standalone: true,
  template: `
    <input
      type="checkbox"
      [checked]="done()"
      (change)="toggleTodo.toggle(todoId(), !done())"
      class="w-4 h-4 cursor-pointer accent-blue-500"
    />
  `,
})
export class ToggleTodoCheckboxComponent {
  todoId = input.required<number>();
  done = input.required<boolean>();
  protected toggleTodo = inject(ToggleTodoService);
}
