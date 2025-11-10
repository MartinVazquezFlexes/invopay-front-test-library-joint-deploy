import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription, debounceTime, fromEvent } from 'rxjs';

import { Chart, Data, Point } from './Interface-chart';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  animations: [
    trigger('fideIn', [
      state(
        'inactive',
        style({
          opacity: '1',
        })
      ),
      state(
        'active',
        style({
          opacity: '0',
        })
      ),
      transition('inactive => active', animate('100ms ease-out')),
      transition('active => inactive', animate('100ms ease-in')),
    ]),
  ],
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer') chartHTML!: ElementRef;
  @ViewChild('focusPoint') focusPoint!: ElementRef;
  @Input() lineTooltip: boolean = false;
  @Input() data!: Chart;
  @Input() lastDay!: string;
  @Output() handlePoint = new EventEmitter<Point>();
  animationFideIn: string = 'inactive';
  datasets: Data[] = [];
  dateLabels!: string[];
  dataLabels!: string[];
  dataValues!: number[];
  rowsLine!: number[];
  widthChart!: number;
  heightChart!: number;
  resizeObserver!: ResizeObserver;
  points: Point[] = [];
  nearestPoint!: Point;
  padding!: number;
  positionsX!: number[];
  private mouseMoveSub: Subscription = new Subscription();

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.loadChart();
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      this.loadChart();
    });
    this.resizeObserver.observe(this.chartHTML.nativeElement);

    const mouseMove$ = fromEvent(this.chartHTML.nativeElement, 'mousemove');

    this.mouseMoveSub = mouseMove$
      .pipe(debounceTime(10))
      .subscribe((event: any) => {
        this.onMouseMove(event);
      });

    const mouseLeave$ = fromEvent(this.chartHTML.nativeElement, 'mouseleave');

    this.mouseMoveSub = mouseLeave$
      .pipe(debounceTime(10))
      .subscribe((event: any) => {
        this.onMouseLeave();
      });
  }

  ngOnDestroy(): void {
    this.mouseMoveSub.unsubscribe();
  }

  setGradient = (id: string) => `url(#G${id})`;
  setShadow = (id: string) => `url(#S${id})`;

  private reloadAnimationFideIn() {
    this.animationFideIn = 'active';
    this.changeDetector.detectChanges();
    setTimeout(() => {
      this.animationFideIn = 'inactive';
      this.changeDetector.detectChanges();
    }, 100);
  }

  private loadChart(): void {
    this.reloadAnimationFideIn();
    this.datasets = this.data.datasets;
    this.dateLabels = this.data.labels;
    this.dataValues = this.processData(this.mergeData(this.data));
    this.dataLabels = this.getDataLabels();
    this.rowsLine = this.getRowsLine();
    this.points = [];
    this.padding = this.data.padding ? this.data.padding : 1;
    if (this.chartHTML) {
      this.widthChart = this.chartHTML.nativeElement.clientWidth;
      this.heightChart = this.chartHTML.nativeElement.clientHeight;
      this.datasets = this.datasets.map((dataset) => {
        dataset.direction = this.getDirectionOfName(dataset);
        return dataset;
      });
    }
  }

  private mergeData(data: Chart): number[] {
    return data.datasets.reduce((result: number[], data: Data) => {
      return [...result, ...data.data];
    }, []);
  }

  private processData(data: number[]): number[] {
    const dataMax = Math.max(...data);
    const dataMin = Math.min(...data);
    let max = dataMax > 0 ? dataMax * 1.1 : dataMax < 0 ? dataMax * 0.9 : 1;
    let min = dataMin > 0 ? dataMin * 0.9 : dataMin < 0 ? dataMin * 1.1 : -1;
    const stepToMin = Math.abs(max - min) / (this.data.row.rowNumber - 1);
    const dataProcess = Array(this.data.row.rowNumber).fill(max);
    return dataProcess.map(
      (data: number, index: number) => data - stepToMin * index
    );
  }

  private getDataLabels = () =>
    this.dataValues.map((value) => this.formatAmount(value));

  formatAmount(amount: number): string {
    if (amount < 0) {
      return '-';
    }
    const sign = amount < 0 ? '-' : '';
    amount = Math.abs(amount);
    const letter =
      amount < 1000
        ? ''
        : amount < 100000
        ? 'K'
        : amount < 1000000000
        ? 'M'
        : 'B';
    const amountFormatted =
      letter == ''
        ? amount
        : letter == 'K'
        ? amount / 1000
        : letter == 'M'
        ? amount / 1000000
        : amount / 1000000000;
    return (
      sign +
      (amountFormatted % 1 === 0
        ? `${amountFormatted.toFixed(0)}${letter}`
        : `${amountFormatted.toFixed(1)}${letter}`)
    );
  }

  getPercentOfArray(index: number, length: number, top?: number) {
    const topPercent: number = top ? top : 100;
    const stepToZero: number = topPercent / (length - 1);
    return topPercent - stepToZero * index;
  }

  getRowsLine(): number[] {
    const percents: number[] = Array(this.data.row.rowNumber).fill(100);
    return percents.map(
      (percent: number, index: number) =>
        percent - (percent / (this.data.row.rowNumber - 1)) * index
    );
  }

  getPercentRowOfValue(value: number, amounts: number[]) {
    const index = amounts.findIndex((amount) => value >= amount);
    const percentTop: number = this.getPercentOfArray(
      index - 1,
      amounts.length
    );
    const percentBottom: number = this.getPercentOfArray(index, amounts.length);
    const valueTop = amounts[index - 1];
    const valueBottom = amounts[index];
    const stepToTop: number =
      (percentTop - percentBottom) / Math.abs(valueTop - valueBottom);
    const percentOfValue =
      percentBottom + stepToTop * Math.abs(value - valueBottom);
    return percentOfValue;
  }

  getPxOfPercent = (maxPixel: number, percent: number) =>
    (maxPixel / 100) * percent;

  private setPositionsX(): void {
    let positionsX: number[] = [];
    let width = this.widthChart * (1 - this.padding / 100);
    this.data.labels.forEach((value, index) => {
      const percentX = this.getPercentOfArray(
        index,
        this.data.labels.length,
        100 - this.padding
      );
      const pointX = width - this.getPxOfPercent(width, percentX);
      positionsX.push(pointX);
    });
    this.positionsX = positionsX;
  }

  getDirectionOfName(data: Data): string {
    const pathLine = (x: number, y: number) => ` L${x},${y}`;
    // // TODO: Fix curve
    // // Original:
    // const pathCurve = (x: number, y: number) => ` S${x * 0.9},${y * 1.01} ${x},${y}`;
    // // Just slightly better:
    const pathCurve = (x: number, y: number) =>
      ` S${x * 0.98},${y * 1.001} ${x},${y}`;
    const pathFunction = data.typeLine == 'curve' ? pathCurve : pathLine;
    let width = this.widthChart * (1 - this.padding / 100);
    let direction: string = '';
    this.setPositionsX();
    data.data.forEach((value, index) => {
      const percentX = this.getPercentOfArray(
        index,
        this.data.labels.length,
        100 - this.padding
      );
      const pointX = width - this.getPxOfPercent(width, percentX);
      const percentY = 100 - this.getPercentRowOfValue(value, this.dataValues);
      const pointY = this.getPxOfPercent(this.heightChart, percentY);

      if (index == 0) {
        direction += 'M' + pointX + ',' + pointY;
      } else {
        direction += pathFunction(pointX, pointY);
      }

      this.newPoint(pointX, pointY, data, value, index);
    });
    return direction;
  }

  newPoint(
    posX: number,
    posY: number,
    data: Data,
    value: number,
    index: number
  ) {
    if (
      !this.points.find((point) => {
        return point.id == data.id && point.posX == posX && point.posY == posY;
      })
    ) {
      this.points.push({
        posX,
        posY,
        id: data.id,
        dataPoint: data.dataPoint,
        value,
        index,
      });
    }
  }

  onMouseMove(event: MouseEvent) {
    const nearestPoint: Point = this.points.reduce(
      (prevPoint: Point, nextPoint: Point) => {
        const distancePrev = this.calculateDistance(
          event.offsetX,
          event.offsetY,
          prevPoint.posX,
          prevPoint.posY
        );
        const distanceNext = this.calculateDistance(
          event.offsetX,
          event.offsetY,
          nextPoint.posX,
          nextPoint.posY
        );
        return distancePrev < distanceNext ? prevPoint : nextPoint;
      },
      this.points[0]
    );
    if (
      this.nearestPoint == undefined ||
      !(this.nearestPoint == nearestPoint)
    ) {
      this.nearestPoint = nearestPoint;
      this.handlePoint.emit(this.nearestPoint);
    }
    this.focusPoint.nativeElement.style.opacity = 1;
  }

  private calculateDistance(x1: number, y1: number, x2: number, y2: number) {
    let distanceX = x2 - x1;
    let distanceY = y2 - y1;
    const result = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    return result;
  }

  onMouseLeave() {
    this.focusPoint.nativeElement.style.opacity = 0;
  }

  showLabel(label: string) {
    const labels = ['1', '5', '10', '15', '20', '25', this.lastDay];
    if (labels.indexOf(label) >= 0) {
      return;
    }
    return 'none';
  }
}
