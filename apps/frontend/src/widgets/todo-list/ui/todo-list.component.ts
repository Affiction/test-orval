import { Component, inject } from '@angular/core';
import { TodoStore, TodoCardComponent } from '@entities/todo';
import { DeleteTodoButtonComponent, ToggleTodoCheckboxComponent } from '@features/todo';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [TodoCardComponent, DeleteTodoButtonComponent, ToggleTodoCheckboxComponent],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  protected store = inject(TodoStore);
}
