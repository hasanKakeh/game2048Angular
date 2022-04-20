import Tile from './tile.model';

export default class Cell {
  #x: any;
  #y: any;
  #tile: Tile;
  #mergeTile: Tile | null;

  constructor(x: any, y: any) {
    this.#x = x;
    this.#y = y;
  }

  set tile(value: Tile) {
    this.#tile = value;
    if (value == null) return;

    this.#tile.x = this.#x;
    this.#tile.y = this.#y;
  }
  get tile() {
    return this.#tile;
  }
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  set mergeTile(value) {
    this.#mergeTile = value;
    if (this.#mergeTile == null) return;
    this.#mergeTile.x = this.#x;
    this.#mergeTile.y = this.#y;
  }
  get mergeTile() {
    return this.#mergeTile;
  }
  canAccept(tile: Tile) {
    return (
      this.#tile == null ||
      (this.#mergeTile == null && this.#tile.value == tile.value)
    );
  }
  mergeTiles() {
    if (this.#mergeTile == null || this.#tile == null) return;
    this.tile.value = this.tile.value + this.#mergeTile.value;
    this.#mergeTile.value = null;
    this.#mergeTile = null;
  }
}
