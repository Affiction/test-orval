import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateTodoService } from '../api/create-todo.service';

@Component({
  selector: 'app-create-todo-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="submit()" class="flex gap-2 mb-6">
      <input
        [(ngModel)]="title"
        name="title"
        placeholder="New todo..."
        class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
      <button
        type="submit"
        [disabled]="!title.trim()"
        class="px-4 py-2 bg-green-500 text-white border-none rounded-md cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add
      </button>
    </form>
  `,
})
export class CreateTodoFormComponent {
  private createTodo = inject(CreateTodoService);
  title = '';

  submit() {
    const value = this.title.trim();
    if (!value) return;
    this.createTodo.create(value);
    this.title = '';
  }
}
