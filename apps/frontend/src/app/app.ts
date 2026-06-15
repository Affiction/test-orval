import { Component } from '@angular/core';
import { TodosPageComponent } from '@pages/todos-page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodosPageComponent],
  templateUrl: './app.html',
})
export class App {}
