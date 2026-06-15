import { Component, inject, input } from '@angular/core';
import { ToggleTodoService } from '../api/toggle-todo.service';

@Component({
  selector: 'app-toggle-todo-checkbox',
  standalone: true,
  templateUrl: './toggle-todo-checkbox.component.html',
})
export class ToggleTodoCheckboxComponent {
  todoId = input.required<number>();
  done = input.required<boolean>();
  protected toggleTodo = inject(ToggleTodoService);
}
