import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-mode-select',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DividerModule],
  templateUrl: './mode-select.html',
  styleUrls: ['./mode-select.scss']
})
export class ModeSelectComponent {
  constructor(private router: Router) {}

  selectMode(baseMin: number, incSec: number) {
    this.router.navigate(['/party'], { queryParams: { baseMin, incSec } });
  }
}
