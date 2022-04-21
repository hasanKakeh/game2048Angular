import { Directive, Renderer2 } from '@angular/core';
import { LogicService } from '../logic.service';

@Directive({
  selector: '[appEventHandler]',
})
export class EventHandlerDirective {
  waitLastEvent = false;
  touchStartX: number;
  touchStartY: number;
  touchEndX: number;
  touchEndY: number;
  constructor(private logicService: LogicService, private renderer: Renderer2) {
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
        this.waitLastEvent = false;
        return;
    }

    this.logicService.mergeTiles();
    this.logicService.generateNewTile();
    this.logicService.isGameOver();

    this.waitLastEvent = false;
  }
  async handleTouch() {
    this.waitLastEvent = true;
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
    this.waitLastEvent = false;
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

      if (!this.waitLastEvent) this.handleTouch();
    });
  }
}
