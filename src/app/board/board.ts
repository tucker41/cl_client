import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';

import 'chessboard-element';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <chess-board
      #cb
      style="width: 520px; height: 520px; display:block; border:2px solid #999; box-sizing: border-box;"
      [attr.position]="fen || 'start'"
      [attr.orientation]="orientation"
      draggable-pieces="true"
      (drop)="onDrop($event)">
    </chess-board>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BoardComponent {
  @ViewChild('cb', { static: true }) cbEl!: ElementRef<any>;

  @Input() fen: string | null = 'start';
  @Input() orientation: 'white' | 'black' = 'white';

  @Output() move = new EventEmitter<{ from: string; to: string }>();

  onDrop(ev: Event) {
    const detail = (ev as CustomEvent<any>).detail;
    if (!detail) return;
    const { source: from, target: to, setAction } = detail;

    // Ignore same-square drag
    if (from === to) {
      if (setAction) setAction('snapback');
      return;
    }

    this.move.emit({ from, to });

    if (setAction) setAction('snapback');
  }
}
