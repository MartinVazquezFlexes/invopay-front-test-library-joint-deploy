import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from '../../shared/models/MenuItem';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  revenueSubmenuOpen = false;
  notificationsSubmenuOpen = false;

  constructor(private translate: TranslateService) {}

  get userType(): string | null {
    return sessionStorage.getItem('userType');
  }

  navigationItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Comisiones', route: '/comisiones' },
    { label: 'Liquidaciones', route: '/liquidaciones' }
  ];

  reportItems: MenuItem[] = [
    { label: 'Resumen Ejecutivo', route: '/resumen-ejecutivo' },
    { label: 'Facturas', route: '/facturas' }
  ];
  toggleRevenueSubmenu() {
    if (!this.isCollapsed) {
      this.revenueSubmenuOpen = !this.revenueSubmenuOpen;
    }
  }

  toggleNotificationsSubmenu() {
    if (!this.isCollapsed) {
      this.notificationsSubmenuOpen = !this.notificationsSubmenuOpen;
    }
  }
}
