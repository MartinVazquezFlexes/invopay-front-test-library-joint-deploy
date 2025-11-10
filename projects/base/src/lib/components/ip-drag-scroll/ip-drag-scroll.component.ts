import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-ip-drag-scroll',
  templateUrl: './ip-drag-scroll.component.html',
  styleUrls: ['./ip-drag-scroll.component.scss']
})
export class IpDragScrollComponent {
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const container = this.el.nativeElement.querySelector('.drag-scroll-container');

    this.isDragging = true;
    this.startX = event.pageX - container.offsetLeft;
    this.startY = event.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;

    this.renderer.addClass(container, 'dragging');

    event.preventDefault();
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUp() {
    const container = this.el.nativeElement.querySelector('.drag-scroll-container');
    this.isDragging = false;
    this.renderer.removeClass(container, 'dragging');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const container = this.el.nativeElement.querySelector('.drag-scroll-container');
    const x = event.pageX - container.offsetLeft;
    const y = event.pageY - container.offsetTop;

    const walkX = x - this.startX;
    const walkY = y - this.startY;

    container.scrollLeft = this.scrollLeft - walkX;
    container.scrollTop = this.scrollTop - walkY;
  }
}
