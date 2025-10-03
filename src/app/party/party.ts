import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { SocketService } from '../services/socket.service';
import { BoardComponent } from '../board/board';

@Component({
  selector: 'app-party',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, TagModule, InputTextModule, InputNumberModule,
    BoardComponent
  ],
  templateUrl: './party.html',
  styleUrls: ['./party.scss']
})
export class PartyComponent implements OnDestroy {
  // controls
  partyId = 'demo-room';
  userId  = 'player-1';
  baseMin = 3;
  incSec  = 2;

  // server state
  status = 'Create or join a party';
  fen = 'start';
  timeMs: { w: number; b: number } = { w: 0, b: 0 };
  turn: 'w' | 'b' | undefined;

  // players/orientation
  whiteId = '';
  blackId = '';
  orientation: 'white' | 'black' = 'white';

  // ticking
  private lastSync: { w: number; b: number } = { w: 0, b: 0 };
  private tickHandle: any;

  constructor(private sock: SocketService) {
    this.sock.on('party:update', (p: any) => {
      this.status = p.status === 'waiting' ? 'Waiting for opponent…' : `Party: ${p.status}`;
    });

    this.sock.on('game:start', (g: any) => {
      this.whiteId = g.whiteId;
      this.blackId = g.blackId;
      this.orientation = (this.userId === this.whiteId) ? 'white' : 'black';

      this.status = 'Game started';
      this.fen = g.fen || 'start';
      this.timeMs = { w: g.baseMs, b: g.baseMs };
      this.turn = 'w';
      this.startTick();
    });

    this.sock.on('move:applied', (m: any) => {
      this.fen = m.fen;
      this.timeMs = m.timeMs;
      this.turn = m.turn;
      this.startTick();
    });

    this.sock.on('game:over', (r: any) => {
      this.status = `Game over: ${r.result} (${r.endReason})`;
      this.stopTick();
    });
  }

  ngOnDestroy(): void { this.stopTick(); }

  join() {
    this.sock.emit('party:join', {
      partyId: this.partyId,
      userId: this.userId,
      baseMin: this.baseMin,
      incSec: this.incSec
    });
  }

  // From BoardComponent
  onBoardMove(evt: { from: string; to: string }) {
    const myColor = (this.userId === this.whiteId) ? 'w' : 'b';
    if (this.turn && myColor !== this.turn) return; // optional guard
    this.sock.emit('move:submit', {
      partyId: this.partyId,
      userId: this.userId,
      from: evt.from,
      to: evt.to
    });
  }

  resign() {
    this.sock.emit('resign', { partyId: this.partyId, userId: this.userId });
  }

  private startTick() {
    this.stopTick();
    this.lastSync = { ...this.timeMs };
    const start = Date.now();
    this.tickHandle = setInterval(() => {
      const elapsed = Date.now() - start;
      const w = this.turn === 'w' ? Math.max(0, this.lastSync.w - elapsed) : this.lastSync.w;
      const b = this.turn === 'b' ? Math.max(0, this.lastSync.b - elapsed) : this.lastSync.b;
      this.timeMs = { w, b };
    }, 200);
  }
  private stopTick() { if (this.tickHandle) { clearInterval(this.tickHandle); this.tickHandle = null; } }

  ms(ms?: number) {
    if (ms == null) return '—:—';
    const s = Math.max(0, Math.floor(ms/1000));
    const m = Math.floor(s/60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2,'0')}`;
  }
}
