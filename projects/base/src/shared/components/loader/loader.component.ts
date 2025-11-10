import { Component, OnInit } from '@angular/core';

import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  isLoading: boolean = true;

  constructor(private loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingService.isLoading$.subscribe((value) => {
      // TODO: a better fix
      setTimeout(() => {
        this.isLoading = value;
      }, 0);
    });
  }
}
