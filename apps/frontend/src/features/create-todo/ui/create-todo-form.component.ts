import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-todo-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="submit()" style="display: flex; gap: 8px; margin-bottom: 24px;">
      <input
        [(ngModel)]="title"
        name="title"
        placeholder="New todo..."
        style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
      />
      <button
        type="submit"
        [disabled]="!title.trim()"
        style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;"
      >
        Add
      </button>
    </form>
  `,
})
export class CreateTodoFormComponent {
  title = '';
  submitted = output<string>();

  submit() {
    const value = this.title.trim();
    if (!value) return;
    this.submitted.emit(value);
    this.title = '';
  }
}
