import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

// Pick a theme preset you like. (Aura is nice.)
import Aura from '@primeuix/themes/aura';
// other options: import Lara from '@primeuix/themes/lara'; etc.

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(), // ✅ new recommended way
    providePrimeNG({
      theme: {
        preset: Aura, // ✅ theme preset
        options: {
          darkModeSelector: '.my-dark' // optional
        }
      }
    })
  ]
};
