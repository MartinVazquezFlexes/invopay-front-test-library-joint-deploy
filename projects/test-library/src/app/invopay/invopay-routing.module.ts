import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IpLoginComponent } from './components/ip-login/ip-login.component';
import { AuthGuard } from './guards/auth.guard';

import { MainLayoutComponent } from '../layout/main-layout/main-layout.component';
import { HomeComponent } from './views/home/home.component';
import { PaymentsEntitiesListComponent } from './views/payments-entities-list/payments-entities-list.component';
import { InsuranceNotificationTrayComponent } from './views/insurance-notification-tray/insurance-notification-tray.component';
import { BrokerNotificationTrayComponent } from './views/broker-notification-tray/broker-notification-tray.component';

import { Template1Component } from './views/template1/template1.component';
import { SchemesListComponent } from './views/schemes-list/schemes-list.component';
import { ProductListComponent } from './views/product-list/product-list.component';
import { SalesListComponent } from './views/sales-list/sales-list.component';
import { SalesDetailsComponent } from './views/sales-details/sales-details.component';
import { RevenuesListComponent } from './views/revenues-list/revenues-list.component';
import { RevenueDetailComponent } from './views/revenue-detail/revenue-detail.component';
import { PendingSalesComponent } from './views/pending-sales/pending-sales.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: HomeComponent,
      },

      {
        path: 'payments-entities',
        component: PaymentsEntitiesListComponent,
      },
      {
        path: 'insurance-notification-tray',
        component: InsuranceNotificationTrayComponent,
      },
      {
        path: 'broker-notification-tray',
        component: BrokerNotificationTrayComponent,
      },
      {
        path: 'schemes-list',
        component: SchemesListComponent,
      },
      {
        path: 'product-list',
        component: ProductListComponent,
      },
      { path: 'sales-list', component: SalesListComponent },
      { path: 'sales-detail/:id', component: SalesDetailsComponent },
      { path: 'revenues-list', component: RevenuesListComponent },
      { path: 'revenue-detail/:id', component: RevenueDetailComponent },
      {
        path: 'assurance/pending-sales-list',
        component: PendingSalesComponent,
        data: { type: 'pending' },
      },
      {
        path: 'assurance/expiry-sales-list',
        component: PendingSalesComponent,
        data: { type: 'expired' },
      },
    ],
  },
  {
    path: 'login-admin',
    component: IpLoginComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login-broker',
    component: IpLoginComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'revenues',
    component: Template1Component,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvopayRoutingModule {}
