import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IpLoginComponent } from './components/ip-login/ip-login.component';

import { IpAuthService } from './services/ip-auth.service';
import { IpProfileService } from './services/ip-profile.service';
import { IpSnackbarService } from './services/ip-snackbar.service';
import { IpTextAreaInputComponent } from './components/ip-text-area-input/ip-text-area-input.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { InvopayRoutingModule } from './invopay-routing.module';

import { TokenInterceptor } from './services/token.interceptor';
import { MobileCardListComponent } from '../shared/components/mobile-card-list/mobile-card-list.component';

import { HomeComponent } from './views/home/home.component';
import { Template1Component } from './views/template1/template1.component';
import { NotificationModalComponent } from './components/notification-modal/notification-modal.component';
import { ProductListComponent } from './views/product-list/product-list.component';
import { IpNotificationModalFilterMobileComponent } from './components/ip-notification-modal-filter-mobile/ip-notification-modal-filter-mobile.component';
import { BrokerSettlementCommentsComponent } from './views/broker-settlement-comments/broker-settlement-comments.component';
import { BrokerInvoiceCommentsComponent } from './views/broker-invoice-comments/broker-invoice-comments.component';
import { AdminSettlementCommentsComponent } from './views/admin-settlement-comments/admin-settlement-comments.component';
import { AdminInvoiceCommentsComponent } from './views/admin-invoice-comments/admin-invoice-comments.component';
import { InstanceComisionDetailComponent } from './views/instance-comision-detail/instance-comision-detail.component';
import { IpInstanceDetailInfoComponent } from './components/ip-instance-detail-info/ip-instance-detail-info.component';
import { SchemeInstanceComponent } from './views/scheme-instance/scheme-instance.component';
import { PolicyListComponent } from './views/policy-list/policy-list.component';
import { PolicyListFiltersModalDialogComponent } from './components/policy-list-filters-modal-dialog/policy-list-filters-modal-dialog.component';



@NgModule({
    declarations: [
        IpLoginComponent,
        MobileCardListComponent,
        HomeComponent,
        Template1Component,
        NotificationModalComponent,
        ProductListComponent,
        IpNotificationModalFilterMobileComponent,
        BrokerSettlementCommentsComponent,
        BrokerInvoiceCommentsComponent,
        AdminSettlementCommentsComponent,
        AdminInvoiceCommentsComponent,
        InstanceComisionDetailComponent,
        IpInstanceDetailInfoComponent,
        SchemeInstanceComponent,
        PolicyListFiltersModalDialogComponent,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        InvopayRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule,
        MatSnackBarModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        RouterModule,
        SharedModule
    ],
    providers: [
        IpAuthService,
        IpProfileService,
        IpSnackbarService,
        SharedModule
    ],
    exports: [
        IpLoginComponent,
        IpTextAreaInputComponent,
        MobileCardListComponent,
        NotificationModalComponent
    ]
})
export class InvopayModule { }