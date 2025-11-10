import { Component, ElementRef, HostListener, Renderer2, NgZone } from '@angular/core';

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
  private rafId: number | null = null;

  constructor(
    private el: ElementRef, 
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // Solo activar en elementos no interactivos
    const target = event.target as HTMLElement;
    if (this.isInteractiveElement(target)) return;

    const container = this.el.nativeElement.querySelector('.drag-scroll-container');

    this.ngZone.runOutsideAngular(() => {
      this.isDragging = true;
      this.startX = event.pageX - container.offsetLeft;
      this.startY = event.pageY - container.offsetTop;
      this.scrollLeft = container.scrollLeft;
      this.scrollTop = container.scrollTop;

      this.renderer.addClass(container, 'dragging');
    });

    event.preventDefault();
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUp() {
    if (!this.isDragging) return;

    this.ngZone.runOutsideAngular(() => {
      const container = this.el.nativeElement.querySelector('.drag-scroll-container');
      this.isDragging = false;
      this.renderer.removeClass(container, 'dragging');
      
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    // Throttle con requestAnimationFrame
    if (this.rafId) return;

    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(() => {
        const container = this.el.nativeElement.querySelector('.drag-scroll-container');
        const x = event.pageX - container.offsetLeft;
        const y = event.pageY - container.offsetTop;

        const walkX = x - this.startX;
        const walkY = y - this.startY;

        container.scrollLeft = this.scrollLeft - walkX;
        container.scrollTop = this.scrollTop - walkY;
        
        this.rafId = null;
      });
    });
  }

  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA'];
    const interactiveClasses = [
      'table__head-row-itemSortable',
      'table__body-row-actions-list-item',
      'table__body-row-item__check'
    ];
    
    if (interactiveTags.includes(element.tagName)) return true;
    
    if (interactiveClasses.some(className => element.classList.contains(className))) {
      return true;
    }
    
    // Verificar elementos padre
    let parent = element.parentElement;
    let level = 0;
    while (parent && level < 3) {
      if (interactiveTags.includes(parent.tagName) || 
          interactiveClasses.some(className => parent?.classList.contains(className))) {
        return true;
      }
      parent = parent.parentElement;
      level++;
    }
    
    return false;
  }
}
