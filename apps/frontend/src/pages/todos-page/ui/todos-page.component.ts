import { Component, inject, OnInit } from '@angular/core';
import { TodoStore } from '@entities/todo';
import { CreateTodoFormComponent } from '@features/todo';
import { TodoListComponent } from '@widgets/todo-list';

@Component({
  selector: 'app-todos-page',
  standalone: true,
  imports: [CreateTodoFormComponent, TodoListComponent],
  template: `
    <div class="max-w-xl mx-auto mt-10 px-4">
      <h1 class="mb-6 text-2xl font-semibold">Todos</h1>
      <app-create-todo-form />
      <app-todo-list />
    </div>
  `,
})
export class TodosPageComponent implements OnInit {
  private store = inject(TodoStore);

  ngOnInit() {
    this.store.load();
  }
}
