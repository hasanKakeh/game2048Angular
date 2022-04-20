import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LogicService } from '../../logic.service';
import Cell from '../../model/cell.model';
import Tile from '../../model/tile.model';
import utility from '../../utility';
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  animations: [
    trigger('gameOverAnimate', [
      transition(':enter', [style({ opacity: 0 }), animate('1s ease-in-out')]),
    ]),
  ],
})
export class GridComponent implements OnInit, OnDestroy {
  readonly CELL_SIZE = utility.CELL_SIZE;
  readonly CELL_GAP = utility.CELL_GAP;
  readonly GRID_SIZE = utility.GRID_SIZE;
  cells: Cell[];
  tiles: Tile[];
  waitLastEvent: boolean = false;
  touchStartX: number;
  touchStartY: number;
  touchEndX: number;
  touchEndY: number;
  isGameOver: any;
  destroy = new Subject();
  constructor(private renderer: Renderer2, private logicService: LogicService) {
    this.logicService.cells$
      .asObservable()
      .pipe(takeUntil(this.destroy))
      .subscribe((value) => {
        this.cells = value;
      });
    this.logicService.tiles$
      .asObservable()
      .pipe(takeUntil(this.destroy))
      .subscribe((value) => {
        this.tiles = value;
      });
    this.isGameOver = this.logicService.isOver$;
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.logicService.initBoard();
    this.addEventListener();
  }
  async handleInput(e: KeyboardEvent) {
    this.waitLastEvent = true;
    switch (e.key) {
      case 'ArrowUp':
        await this.logicService.moveUp();
        break;
      case 'ArrowDown':
        await this.logicService.moveDown();
        break;
      case 'ArrowLeft':
        await this.logicService.moveLeft();
        break;
      case 'ArrowRight':
        await this.logicService.moveRight();
        break;
      default:
        return;
    }

    this.logicService.mergeTiles();
    this.logicService.generateNewTile();
    this.logicService.isGameOver();

    this.waitLastEvent = false;
  }
  async handleTouch() {
    const dx = Math.abs(this.touchStartX - this.touchEndX);
    const dy = Math.abs(this.touchStartY - this.touchEndY);
    console.log({ dx, dy });
    if (dx > dy) {
      if (this.touchStartX > this.touchEndX) await this.logicService.moveLeft();
      if (this.touchEndX > this.touchStartX)
        await this.logicService.moveRight();
      this.logicService.mergeTiles();
      this.logicService.generateNewTile();
      this.logicService.isGameOver();
    }
    if (dy > dx) {
      if (this.touchStartY > this.touchEndY) await this.logicService.moveUp();
      if (this.touchEndY > this.touchStartY) await this.logicService.moveDown();
      this.logicService.mergeTiles();
      this.logicService.generateNewTile();
      this.logicService.isGameOver();
    }
  }

  addEventListener() {
    this.renderer.listen(document, 'keydown', (e: KeyboardEvent) => {
      if (!this.waitLastEvent) this.handleInput(e);
    });
    this.renderer.listen(document, 'touchstart', (e: TouchEvent) => {
      this.touchStartX = e.changedTouches[0].clientX;
      this.touchStartY = e.changedTouches[0].clientY;
    });
    this.renderer.listen(document, 'touchend', (e: TouchEvent) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleTouch();
    });
  }
}
