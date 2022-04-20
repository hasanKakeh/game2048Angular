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
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-in-out'),
      ]),
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
  addEventListener() {
    this.renderer.listen(document, 'keydown', (e: KeyboardEvent) => {
      if (!this.waitLastEvent) this.handleInput(e);
    });
  }
}
