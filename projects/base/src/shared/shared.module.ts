import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../lib/components/components.module';
import { AmountInputComponent } from './components/amount-input/amount-input.component';
import { BackNavigateButtonComponent } from './components/back-navigate-button/back-navigate-button.component';
import { ChartComponent } from './components/chart/chart.component';
import { CustomIconColorComponent } from './components/custom-icon-color/custom-icon-color.component';
import { InnerLoaderComponent } from './components/inner-loader/inner-loader.component';
import { LoaderComponent } from './components/loader/loader.component';
import { NoDataComponent } from './components/no-data/no-data.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { TableComponent } from './components/table/table.component';
import { MaterialModule } from './material/material.module';
import { SafePipe } from './pipes/safe.pipe';
import { MatDialogService } from './services/mat-dialog.service';
import { AmountFormatPipe } from './Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from './Utils/currency-simbol-pipe';
import { LastFourDigitsPipe } from './Utils/lastFourDigits-pipe';
import { CustomDatePipe } from './Utils/pipeCustomDate';
import { TransformDataTablePipe } from './Utils/transform-data-table.pipe';
import { TruncatePipe } from './Utils/truncate.pipe';
import { CdkFixedSizeVirtualScroll, ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    ChartComponent,
    TableComponent,
    PaginatorComponent,
    CustomDatePipe,
    TransformDataTablePipe,
    AmountFormatPipe,
    CurrencySymbolPipe,
    LastFourDigitsPipe,
    CustomIconColorComponent,
    LoaderComponent,
    SafePipe,
    NoDataComponent,
    BackNavigateButtonComponent,
    TruncatePipe,
    BackNavigateButtonComponent,
    //IpDragScrollComponent,
    InnerLoaderComponent,
    //IpFiltersTableInvoicesComponent,
    //IpSelectInputComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    AmountInputComponent,
    MatCheckboxModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  providers: [
    DatePipe,
    AmountFormatPipe,
    MatDialogService,
    TruncatePipe,
  ],
  exports: [
    MaterialModule,
    ChartComponent,
    TableComponent,
    PaginatorComponent,
    ReactiveFormsModule,
    CustomDatePipe,
    AmountFormatPipe,
    CurrencySymbolPipe,
    LastFourDigitsPipe,
    BackNavigateButtonComponent,
    CustomIconColorComponent,
    FormsModule,
    LoaderComponent,
    AmountInputComponent,
    SafePipe,
    NoDataComponent,
    TruncatePipe,
    //IpDragScrollComponent,
    InnerLoaderComponent,
    ComponentsModule,
    DatePipe
    //IpFiltersTableInvoicesComponent,
    //IpSelectInputComponent
  ],
})
export class SharedModule { }
