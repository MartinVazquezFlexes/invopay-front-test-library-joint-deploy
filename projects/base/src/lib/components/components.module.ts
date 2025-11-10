import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MaterialModule } from "../../shared/material/material.module";
import { IpButtonModalComponent } from "./ip-button-modal/ip-button-modal.component";
import { IpDateInputComponent } from "./ip-date-input/ip-date-input.component";
import { IpDragScrollComponent } from "./ip-drag-scroll/ip-drag-scroll.component";
import { IpInputComponent } from "./ip-input/ip-input.component";
import { IpModalMobileComponent } from "./ip-modal-mobile/ip-modal-mobile.component";
import { IpSelectInputComponent } from "./ip-select-input/ip-select-input.component";
import { IpTextAreaInputComponent } from "./ip-text-area-input/ip-text-area-input.component";
import { IpTitleMobileComponent } from "./ip-title-mobile/ip-title-mobile.component";


@NgModule({
    declarations: [
        IpInputComponent,
        IpDateInputComponent,
        IpSelectInputComponent,
        IpTextAreaInputComponent,
        IpTitleMobileComponent,
        IpModalMobileComponent,
        IpButtonModalComponent,
        IpDragScrollComponent,
    ],
    imports: [ReactiveFormsModule, MaterialModule, TranslateModule, CommonModule],
    exports: [TranslateModule,
        IpInputComponent, IpDateInputComponent, IpSelectInputComponent,
        IpTextAreaInputComponent, IpTitleMobileComponent, IpModalMobileComponent, IpButtonModalComponent
        , IpDragScrollComponent
    ],
})
export class ComponentsModule { }