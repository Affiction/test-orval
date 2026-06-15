import { Component, input } from '@angular/core';
import { Todo } from '@shared/api';

@Component({
  selector: 'app-todo-card',
  standalone: true,
  template: `
    <span
      [style.text-decoration]="todo().done ? 'line-through' : 'none'"
      [style.color]="todo().done ? '#999' : '#222'"
    >
      {{ todo().title }}
    </span>
  `,
})
export class TodoCardComponent {
  todo = input.required<Todo>();
}
