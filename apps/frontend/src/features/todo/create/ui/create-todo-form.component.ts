import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateTodoService } from '../api/create-todo.service';

@Component({
  selector: 'app-create-todo-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-todo-form.component.html',
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
