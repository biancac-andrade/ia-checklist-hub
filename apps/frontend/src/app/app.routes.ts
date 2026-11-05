import { Route } from '@angular/router';
import { ChecklistComponent } from './features/checklist/checklist.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ChecklistComponent,
  },
];
