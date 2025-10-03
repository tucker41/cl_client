import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-mode-select',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, ToggleButtonModule, InputNumberModule, InputTextModule,
    DividerModule, SelectButtonModule, 
  ],
  templateUrl: './mode-select.html',
  styleUrls: ['./mode-select.scss']
})
export class ModeSelectComponent {
  speed: 'bullet'|'blitz'|'rapid' = 'blitz';
  speedOptions = [
    { label: 'Bullet', value: 'bullet' },
    { label: 'Blitz',  value: 'blitz'  },
    { label: 'Rapid',  value: 'rapid'  }
  ];

  openMatch = true;
  partyId = '';
  baseMin = 3;
  incSec = 2;

  constructor(private router: Router) {}

  onSpeedChange() {
    if (this.speed === 'bullet') { this.baseMin = 1; this.incSec = 0; }
    if (this.speed === 'blitz')  { this.baseMin = 3; this.incSec = 2; }
    if (this.speed === 'rapid')  { this.baseMin = 10; this.incSec = 0; }
  }

  start() {
    const query = {
      baseMin: this.baseMin,
      incSec: this.incSec,
      mode: this.speed,
      open: this.openMatch,
      party: this.openMatch ? '' : (this.partyId || 'my-private-room')
    };
    this.router.navigate(['/game'], { queryParams: query });
  }
}
