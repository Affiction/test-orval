import { Component, inject, OnInit } from '@angular/core';
import { TodoStore } from '@entities/todo';
import { CreateTodoFormComponent } from '@features/todo';
import { TodoListComponent } from '@widgets/todo-list';

@Component({
  selector: 'app-todos-page',
  standalone: true,
  imports: [CreateTodoFormComponent, TodoListComponent],
  templateUrl: './todos-page.component.html',
})
export class TodosPageComponent implements OnInit {
  private store = inject(TodoStore);

  ngOnInit() {
    this.store.load();
  }
}
