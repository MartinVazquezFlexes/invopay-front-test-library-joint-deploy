import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { BaseComponent } from './base.component';
import { ComponentsModule } from './components/components.module';
import { TestViewComponent } from './views/test-view/test-view.component';
import { Template1Component } from './views/template1/template1.component';



@NgModule({
  declarations: [
    BaseComponent,
    TestViewComponent,
    Template1Component
  ],
  imports: [ComponentsModule, SharedModule],
  exports: [BaseComponent],
})
export class BaseModule { }
