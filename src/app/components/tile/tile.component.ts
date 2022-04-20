import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import Tile from 'src/app/model/tile.model';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
  animations: [
    trigger('show', [
      transition(':enter', [
        style({ opacity: 0.5, transform: 'scale(0)' }),
        animate('200ms ease-out'),
      ]),
    ]),
  ],
})
export class TileComponent implements OnInit {
  @ViewChild('elementRef', { static: true }) elemRef: ElementRef;
  @Input() tile: Tile;
  @Output() transitionEnd = new EventEmitter();
  backgroundHue = 200;
  constructor() {}

  get backgroundLightness() {
    let power = Math.log2(this.tile.value);
    power = this.getBackgroundHub(power);
    return `${100 - power * 9}%`;
  }
  ngOnInit(): void {
    this.tile.waitForTransition = (animation: boolean = false) => {
      return new Promise((resolve) => {
        this.elemRef.nativeElement.addEventListener(
          animation ? 'animationend' : 'transitionend',
          resolve,
          { once: true }
        );
      });
    };
  }
  getBackgroundHub(power: number) {
    if (power >= 18) {
      this.backgroundHue = 25;
      power /= 2 + Math.floor(power % 2);
      return power;
    }
    if (power >= 14) {
      this.backgroundHue = 100;
      power /= 2 + Math.floor(power % 2);
      return power;
    }
    if (power >= 10) {
      this.backgroundHue = 50;
      power /= 2 + Math.floor(power % 2);
      return power;
    }
    if (power >= 6) {
      this.backgroundHue = 25;
      power /= 2 + Math.floor(power % 2);
      return power;
    }
    return power;
  }
}
