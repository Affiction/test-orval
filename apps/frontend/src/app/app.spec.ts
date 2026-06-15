import { MockBuilder, MockRender } from 'ng-mocks';
import { App } from './app';
import { TodosPageComponent } from '@pages/todos-page';

describe('App', () => {
  beforeEach(() => MockBuilder(App).mock(TodosPageComponent));

  it('should create the app', () => {
    const fixture = MockRender(App);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should render todos page', () => {
    const fixture = MockRender(App);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-todos-page')).toBeTruthy();
  });
});
