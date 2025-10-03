import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { ModeSelectComponent } from './mode-select/mode-select';
import { PartyComponent } from './party/party';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'modes', component: ModeSelectComponent },
  { path: 'party', component: PartyComponent }
];
