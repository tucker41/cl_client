import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';

import { BoardComponent } from '../board/board';
import { SocketService } from '../services/socket.service';

type Side = 'w' | 'b';

@Component({
  selector: 'app-party',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, TagModule, InputTextModule, DividerModule,
    ToastModule, ProgressBarModule,
    BoardComponent
  ],
  providers: [MessageService],
  templateUrl: './party.html',
  styleUrls: ['./party.scss']
})
export class PartyComponent implements OnDestroy {

  partyId = 'demo-room';
  userId  = 'player-1';
  baseMin = 3;
  incSec  = 2;

  status = 'Create or join a party';
  fen: string | null = 'start';
  timeMs: { w: number; b: number } = { w: 0, b: 0 };
  activeSide: Side | undefined;  
  chessTurn: Side | undefined;   

  whiteId = '';
  blackId = '';
  orientation: 'white' | 'black' = 'white';

  joining = false;
  inGame  = false;

  private lastSync: { w: number; b: number } = { w: 0, b: 0 };
  private tickHandle: any;

  constructor(
    public sock: SocketService,                 
    private route: ActivatedRoute,
    private router: Router,
    private messages: MessageService
  ) {
    // presets from query params
    this.route.queryParamMap.subscribe(q => {
      const base = Number(q.get('baseMin') ?? this.baseMin);
      const inc  = Number(q.get('incSec') ?? this.incSec);
      const party = q.get('party') || this.partyId;
      if (q.keys.length) {
        this.baseMin = base; this.incSec = inc; this.partyId = party;
      }
    });

    // Socket events
    this.sock.on('party:update', (p: any) => {
      this.status = p.status === 'waiting' ? 'Waiting for opponent…' : `Party: ${p.status}`;
    });

    this.sock.on('game:start', (g: any) => {
      this.whiteId = g.whiteId;
      this.blackId = g.blackId;
      this.orientation = (this.userId === this.whiteId) ? 'white' : 'black';

      this.status = 'Game started';
      this.fen = g.fen || 'start';
      this.timeMs = g.timeMs ?? { w: g.baseMs, b: g.baseMs };
      this.activeSide = g.activeSide as Side;
      this.chessTurn  = g.chessTurn  as Side;
      this.inGame = true;

      this.messages.add({ severity: 'success', summary: 'Game', detail: 'Game started!' });
      this.startTick();
    });

    this.sock.on('move:applied', (m: any) => {
      this.fen = m.fen;
      this.timeMs = m.timeMs;
      this.chessTurn = m.chessTurn as Side;
      this.startTick();
    });

    this.sock.on('clock:update', (c: any) => {
      this.timeMs = c.timeMs;
      this.activeSide = c.activeSide as Side;
      this.chessTurn  = c.chessTurn  as Side;
      this.startTick();
    });

    this.sock.on('game:over', (r: any) => {
      this.status = `Game over: ${r.result} (${r.endReason})`;
      this.inGame = false;
      this.stopTick();
      this.messages.add({ severity: 'info', summary: 'Game Over', detail: `${r.result} · ${r.endReason}` });
    });

    this.sock.on('error', (e: any) => {
      this.messages.add({ severity: 'warn', summary: 'Server', detail: String(e) });
    });
  }

  ngOnDestroy(): void { this.stopTick(); }

  goHome() { this.router.navigate(['/']); }

  join() {
    this.joining = true;
    this.sock.emit('party:join', {
      partyId: this.partyId,
      userId: this.userId,
      baseMin: this.baseMin,
      incSec: this.incSec
    });
    setTimeout(() => (this.joining = false), 300);
  }

  resign() {
    this.sock.emit('resign', { partyId: this.partyId, userId: this.userId });
  }

  onBoardMove(evt: { from: string; to: string }) {
    const myColor: Side = (this.userId === this.whiteId) ? 'w' : 'b';
    if (this.chessTurn && myColor !== this.chessTurn) return; 
    this.sock.emit('move:submit', {
      partyId: this.partyId,
      userId: this.userId,
      from: evt.from,
      to: evt.to
    });
  }

  bottomName() { return this.orientation === 'white' ? 'White' : 'Black'; }
  topName()    { return this.orientation === 'white' ? 'Black' : 'White'; }
  bottomSide(): Side { return this.orientation === 'white' ? 'w' : 'b'; }
  topSide(): Side    { return this.orientation === 'white' ? 'b' : 'w'; }

  private startTick() {
    this.stopTick();
    this.lastSync = { ...this.timeMs };
    const start = Date.now();
    const side = this.activeSide; 
    this.tickHandle = setInterval(() => {
      const elapsed = Date.now() - start;
      const w = side === 'w' ? Math.max(0, this.lastSync.w - elapsed) : this.lastSync.w;
      const b = side === 'b' ? Math.max(0, this.lastSync.b - elapsed) : this.lastSync.b;
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
  pct(msLeft: number, baseMin: number) {
    const total = baseMin * 60 * 1000;
    return Math.max(0, Math.min(100, Math.round((msLeft / total) * 100)));
  }
}
