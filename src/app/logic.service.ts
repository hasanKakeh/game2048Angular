import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import Cell from './model/cell.model';
import Tile from './model/tile.model';
import { GRID_SIZE } from './utility';

@Injectable({
  providedIn: 'root',
})
export class LogicService {
  cells$ = new Subject<Cell[]>();
  tiles$ = new Subject<Tile[]>();
  isOver$ = new BehaviorSubject<boolean>(false);
  newTile: Tile | null = null;

  private cells: Cell[] = [];
  private tiles: Tile[] = [];

  score: number = 0;
  bestScore: number = 0;
  constructor() {
    this.bestScore = this.getBestScore();
    // console.log(this.bestScore);
  }

  initBoard() {
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const cell = new Cell(i % GRID_SIZE, Math.floor(i / GRID_SIZE));
      this.cells.push(cell);
    }
    this.cells$.next(this.cells);
    this.generateNewTile();
    this.generateNewTile();
  }

  generateNewTile() {
    this.newTile = new Tile();
    const randomCell = this.randomEmptyCell();
    if (randomCell) {
      randomCell.tile = this.newTile;

      this.tiles.push(this.newTile);
      this.tiles$.next(this.tiles);
    }
  }
  get cellByColumn() {
    return this.cells.reduce((cellGrid: any, cell: any) => {
      cellGrid[cell.x] = cellGrid[cell.x] || [];
      cellGrid[cell.x][cell.y] = cell;
      return cellGrid;
    }, []);
  }

  get cellByRow() {
    return this.cells.reduce((cellGrid: any, cell: any) => {
      cellGrid[cell.y] = cellGrid[cell.y] || [];
      cellGrid[cell.y][cell.x] = cell;
      return cellGrid;
    }, []);
  }

  get #emptyCells() {
    return this.cells.filter((cell: any) => cell.tile == null);
  }

  randomEmptyCell(): Cell {
    const randomIndex = Math.floor(Math.random() * this.#emptyCells.length);
    return this.#emptyCells[randomIndex];
  }

  moveUp() {
    if (this.canMoveUp()) return this.slideTiles(this.cellByColumn);
    return null;
  }
  moveDown() {
    if (this.canMoveDown())
      return this.slideTiles(
        this.cellByColumn.map((column: any) => [...column].reverse())
      );
    return null;
  }
  moveLeft() {
    if (this.canMoveLeft()) return this.slideTiles(this.cellByRow);
    return null;
  }
  moveRight() {
    if (this.canMoveRight())
      return this.slideTiles(
        this.cellByRow.map((row: any) => [...row].reverse())
      );
    return null;
  }

  slideTiles(cells: Array<any>) {
    return Promise.all(
      cells.flatMap((group: any) => {
        const promises = [];
        for (let i = 1; i < group.length; i++) {
          const cell = group[i];
          if (cell.tile == null) continue;
          let lastValidCell;
          for (let j = i - 1; j >= 0; --j) {
            const moveToCell = group[j];

            if (!moveToCell.canAccept(cell.tile)) break;
            lastValidCell = moveToCell;
          }
          if (lastValidCell != null) {
            promises.push(cell.tile.waitForTransition());
            // this.tiles.find((tile) => tile == cell.tile);
            if (lastValidCell.tile != null) lastValidCell.mergeTile = cell.tile;
            else lastValidCell.tile = cell.tile;
            cell.tile = null;
          }
        }
        return promises;
      })
    );
  }
  mergeTiles() {
    this.cells.forEach((cell) => {
      if (cell.mergeTile?.value) {
        this.score += cell.mergeTile.value * 2;
        if (this.bestScore < this.score) this.bestScore = this.score;
      }
      cell.mergeTiles();
    });
    this.cells$.next(this.cells);
    this.tiles = this.tiles.filter((tile) => tile.value > 0);
    this.tiles$.next(this.tiles);
  }
  canMoveUp() {
    return this.canMove(this.cellByColumn);
  }
  canMoveDown() {
    return this.canMove(
      this.cellByColumn.map((column: any) => [...column].reverse())
    );
  }
  canMoveLeft() {
    return this.canMove(this.cellByRow);
  }
  canMoveRight() {
    return this.canMove(this.cellByRow.map((row: any) => [...row].reverse()));
  }
  canMove(cells: any[]) {
    return cells.some((group) => {
      return group.some((cell: any, index: any) => {
        if (index == 0) return false;
        if (cell.tile == null) return false;
        const cellToMove = group[index - 1];
        return cellToMove.canAccept(cell.tile);
      });
    });
  }
  isGameOver() {
    if (
      !this.canMoveDown() &&
      !this.canMoveUp() &&
      !this.canMoveLeft() &&
      !this.canMoveRight()
    ) {
      this.isOver$.next(true)
      this.saveBestScore();
    }
  }
  saveBestScore() {
    localStorage.setItem('bestScore', this.bestScore.toString());
  }
  getBestScore() {
    return Number(localStorage.getItem('bestScore')) | 0;
  }
  resetGame() {
    this.isOver$.next(false)
    this.tiles = [];
    this.cells = [];
    this.tiles$.next(this.tiles);
    this.cells$.next(this.cells);
    this.score = 0;
    this.initBoard();
  }
}
