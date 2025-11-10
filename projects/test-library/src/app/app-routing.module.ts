import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { BaseComponent } from 'base';
import { IpLoginComponent } from './invopay/components/ip-login/ip-login.component';

import { HomeComponent } from './invopay/views/home/home.component';

const routes: Routes = [
   {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    component: IpLoginComponent,
  },
  {
    path: 'login',
    component: IpLoginComponent
  },
  {
    path: 'invopay',
    loadChildren: () =>
      import('./invopay/invopay.module').then((m) => m.InvopayModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
