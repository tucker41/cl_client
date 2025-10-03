import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div style="padding:24px">
      <h1>It works 🎉</h1>
      <p>This is the HomeComponent.</p>
      <p-button label="Just a test button"></p-button>
    </div>
  `
})
export class HomeComponent {}
