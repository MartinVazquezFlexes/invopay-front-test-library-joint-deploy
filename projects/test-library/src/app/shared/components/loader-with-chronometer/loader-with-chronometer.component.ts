import { Component, Input } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-loader-with-chronometer',
  templateUrl: './loader-with-chronometer.component.html',
  styleUrls: ['./loader-with-chronometer.component.scss']
})
export class LoaderWithChronometerComponent {
  public elapsedSeconds = 0;
  private timerSubscription: Subscription | null = null;
  @Input() loaderText?: string

  ngOnInit() {
    this.startTimer();
  }  
  
  startTimer() {
    if (this.timerSubscription) {
      return; 
    }
    this.elapsedSeconds = 0;
    this.timerSubscription = interval(1000).subscribe(() => {
      this.elapsedSeconds++;
    });
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null; 
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
