import { Component, input } from '@angular/core';
import { Todo } from '@shared/api';

@Component({
  selector: 'app-todo-card',
  standalone: true,
  templateUrl: './todo-card.component.html',
})
export class TodoCardComponent {
  todo = input.required<Todo>();
}
