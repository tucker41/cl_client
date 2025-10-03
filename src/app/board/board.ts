import {
  Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild,
  CUSTOM_ELEMENTS_SCHEMA                               // ⬅️ add this
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Register the custom element (side-effect import)
import 'chessboard-element';                             // ⬅️ IMPORTANT

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]                      // ⬅️ tell Angular “this is a custom element”
})
export class BoardComponent implements OnChanges {
  @ViewChild('cb', { static: true }) cbEl!: ElementRef<any>;
  @Input() fen: string | null = 'start';
  @Input() orientation: 'white' | 'black' = 'white';
  @Output() move = new EventEmitter<{ from: string; to: string }>();

  ngOnChanges(changes: SimpleChanges): void {
    const el = this.cbEl?.nativeElement;
    if (!el) return;
    if (changes['fen'] && this.fen) el.position = this.fen;
    if (changes['orientation'] && this.orientation) el.orientation = this.orientation;
  }

  onDrop(ev: Event) {
  const detail = (ev as CustomEvent<any>).detail;
  if (!detail) return;

  const { source: from, target: to, setAction } = detail;

  // Ignore no-op drops like d2→d2
  if (from === to) {
    if (setAction) setAction('snapback');
    return;
  }

  this.move.emit({ from, to });

  // Let the server be the source of truth
  if (setAction) setAction('snapback');
}
}
