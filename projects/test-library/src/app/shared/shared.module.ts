import { CdkFixedSizeVirtualScroll, ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { IpButtonModalComponent } from '../invopay/components/ip-button-modal/ip-button-modal.component';
import { IpDateInputComponent } from '../invopay/components/ip-date-input/ip-date-input.component';
import { IpDragScrollComponent } from '../invopay/components/ip-drag-scroll/ip-drag-scroll.component';
import { IpInputComponent } from '../invopay/components/ip-input/ip-input.component';
import { IpModalMobileComponent } from '../invopay/components/ip-modal-mobile/ip-modal-mobile.component';
import { IpSelectInputComponent } from '../invopay/components/ip-select-input/ip-select-input.component';
import { IpTextAreaInputComponent } from '../invopay/components/ip-text-area-input/ip-text-area-input.component';
import { IpTitleMobileComponent } from '../invopay/components/ip-title-mobile/ip-title-mobile.component';
import { AmountInputComponent } from './components/amount-input/amount-input.component';
import { BackNavigateButtonComponent } from './components/back-navigate-button/back-navigate-button.component';
import { CardTableComponent } from './components/card-table/card-table.component';
import { ChartComponent } from './components/chart/chart.component';
import { CustomIconColorComponent } from './components/custom-icon-color/custom-icon-color.component';
import { InnerLoaderComponent } from './components/inner-loader/inner-loader.component';
import { LangSelectorComponent } from './components/langSelector/langSelector.component';
import { LoaderWithChronometerComponent } from './components/loader-with-chronometer/loader-with-chronometer.component';
import { LoaderComponent } from './components/loader/loader.component';
import { NoDataComponent } from './components/no-data/no-data.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { TableComponent } from './components/table/table.component';
import { MaterialModule } from './material/material.module';
import { SafePipe } from "./pipes/safe.pipe";
import { MatDialogService } from './services/mat-dialog.service';
import { AmountFormatPipe } from './Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from './Utils/currency-simbol-pipe';
import { FormatTimePipe } from './Utils/format-time.pipe';
import { LastFourDigitsPipe } from './Utils/lastFourDigits-pipe';
import { CustomDatePipe } from './Utils/pipeCustomDate';
import { TransformDataTablePipe } from './Utils/transform-data-table.pipe';
import { TruncatePipe } from './Utils/truncate.pipe';

@NgModule({
  declarations: [
    ChartComponent,
    TableComponent,
    PaginatorComponent,
    CustomDatePipe,
    CardTableComponent,
    TransformDataTablePipe,
    AmountFormatPipe,
    CurrencySymbolPipe,
    LastFourDigitsPipe,
    CustomIconColorComponent,
    LangSelectorComponent,
    LoaderComponent,
    IpModalMobileComponent,
    IpTitleMobileComponent,
    IpButtonModalComponent,
    IpDateInputComponent,
    IpTextAreaInputComponent,
    IpInputComponent,
    IpDragScrollComponent,
    InnerLoaderComponent,
    IpSelectInputComponent,
    FormatTimePipe,
    LoaderWithChronometerComponent,
    BackNavigateButtonComponent,
    SafePipe,
    NoDataComponent,
    TruncatePipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    AmountInputComponent,
    MatCheckboxModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    CdkFixedSizeVirtualScroll,
    ScrollingModule
  ],
  providers: [
    TransformDataTablePipe,
    AmountFormatPipe,
    MatDialogService,
    TruncatePipe,
    CustomDatePipe,
    CurrencySymbolPipe
  ],
  exports: [
    MaterialModule,
    ChartComponent,
    TableComponent,
    PaginatorComponent,
    ReactiveFormsModule,
    CustomDatePipe,
    CardTableComponent,
    AmountFormatPipe,
    CurrencySymbolPipe,
    LastFourDigitsPipe,
    BackNavigateButtonComponent,
    CustomIconColorComponent,
    FormsModule,
    LangSelectorComponent,
    LoaderComponent,
    AmountInputComponent,
    SafePipe,
    NoDataComponent,
    TruncatePipe,
    IpModalMobileComponent,
    CardTableComponent,
    IpTitleMobileComponent,
    IpButtonModalComponent,
    IpDateInputComponent,
    IpTextAreaInputComponent,
    IpInputComponent,
    IpDragScrollComponent,
    InnerLoaderComponent,
    IpSelectInputComponent,
    NgxMatSelectSearchModule,
    LoaderWithChronometerComponent
  ],
})
export class SharedModule { }
