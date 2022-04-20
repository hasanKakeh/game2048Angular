
export default class Tile {
  #x: any;
  #y: any;
 
  #value: any;
  waitForTransition: Function;

  constructor(value = Math.random() > 0.6 ? 2 : 4) {
    this.#value = value;
  }

  get value() {
    return this.#value;
  }
  set value(value) {
    this.#value = Number(value);
  }

  set x(value: any) {
    this.#x = value;
  }
  set y(value: any) {
    this.#y = value;
  }
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
}
