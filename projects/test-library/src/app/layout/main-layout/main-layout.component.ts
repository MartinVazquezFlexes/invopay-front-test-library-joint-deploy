import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../shared/services/loading.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit{
  isSidebarCollapsed = false;
  constructor(public loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadingService.setLoadingState(false);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
