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


const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent,
      },
     
      {
        path: 'payments-entities',
        component: PaymentsEntitiesListComponent
      },
      {
        path: 'insurance-notification-tray',
        component: InsuranceNotificationTrayComponent
      },
      {
        path: 'broker-notification-tray',
        component: BrokerNotificationTrayComponent
      },
      {
        path: 'schemes-list',
        component: SchemesListComponent
      },
    ]
  },
  {
    path: 'login-admin',
    component: IpLoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login-broker',
    component: IpLoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'revenues',
    component: Template1Component
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvopayRoutingModule { }
