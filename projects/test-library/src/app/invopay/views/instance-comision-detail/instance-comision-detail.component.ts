import { Component, OnDestroy, OnInit } from '@angular/core';

import { BrokerCategory, Instance, Product } from '../../interface/ip-instance-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import IpSelectInputOption from '../../interface/ip-select-input-option';
import { IpInstanceDetailService } from '../../services/ip-instance-detail.service';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../../shared/services/loading.service';

@Component({
  selector: 'app-instance-comision-detail',
  templateUrl: './instance-comision-detail.component.html',
  styleUrls: ['./instance-comision-detail.component.scss']
})
export class InstanceComisionDetailComponent implements OnInit,OnDestroy {
  // Form Controls
  nameControl = new FormControl('');
  schemeTypeControl = new FormControl('');
  ruleScopeControl = new FormControl('');
  hasIncentiveCategoryControl = new FormControl(false);
  brokerCategoryControl = new FormControl('');
  isActiveControl = new FormControl(true);
  percentageControl = new FormControl<number>(0);
  fixedAmountControl = new FormControl<number>(0);
  byBrokerControl = new FormControl<boolean>(false);
  byProductControl = new FormControl<boolean>(false);
  commissionSchemeIdControl = new FormControl<number>(0);
  createdByUserIdControl = new FormControl<number>(0);
  createdDateControl = new FormControl<string>('');
  lastUpdateControl = new FormControl<string>('');
  validFromControl = new FormControl<string>('');
  validUntilControl = new FormControl<string>('');
  enterpriseIdControl = new FormControl<number>(0);
  deletableControl = new FormControl<boolean>(false);
  editableControl = new FormControl<boolean>(false);
  subscription=new Subscription();
  form: FormGroup;
  commissionSchemeId:number=0;
  brokers: BrokerCategory[] = [];
  products: Product[] = [];
  schemeTypeOptions: IpSelectInputOption[] = [];
  ruleScopeOptions: IpSelectInputOption[] = [];
  brokerCategoryOptions: IpSelectInputOption[] = [];
  private currentId?: string
  instance: Instance | null = null;
  isTrueInsance:boolean=false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private instanceService:IpInstanceDetailService,
    private translate: TranslateService,
    public loadingService:LoadingService
  ) {
    this.form = new FormGroup({
      // Basic Info
      name: this.nameControl,
      schemeType: this.schemeTypeControl,
      ruleScope: this.ruleScopeControl,
      hasIncentiveCategory: this.hasIncentiveCategoryControl,
      brokerCategory: this.brokerCategoryControl,
      isActive: this.isActiveControl,
      percentage: this.percentageControl,
      fixedAmount: this.fixedAmountControl,
      
      // Commission Settings
      byBroker: this.byBrokerControl,
      byProduct: this.byProductControl,
      
      // Metadata
      commissionSchemeId: this.commissionSchemeIdControl,
      createdByUserId: this.createdByUserIdControl,
      createdDate: this.createdDateControl,
      lastUpdate: this.lastUpdateControl,
      validFrom: this.validFromControl,
      validUntil: this.validUntilControl,
      enterpriseId: this.enterpriseIdControl,
      deletable: this.deletableControl,
      editable: this.editableControl
    });

    Object.values(this.form.controls).forEach(control => {
      control.disable();
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add( this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      if (!id) return;
      this.loadingService.setLoadingState(true);
      this.loadInstanceData(parseInt(id));
    }))
  }


 get formValue(): Instance {
  const values = this.form.getRawValue();
  return {
    name: values.name || '',
    schemaType: values.schemeType || '',
    scope: values.ruleScope || '',
    hasIncentiveScheme: values.hasIncentiveCategory === 'true',
    isActive: values.isActive === 'true',
    commissionSchemeId: values.commissionSchemeId || 0,
    commissionPercentage: values.percentage || 0,
    commissionFixedAmount: values.fixedAmount || 0,
    byBroker: values.byBroker || false,
    byProduct: values.byProduct || false,
    createdByUserId: values.createdByUserId || 0,
    createdDate: values.createdDate || '',
    lastUpdate: values.lastUpdate || '',
    validFrom: values.validFrom || '',
    validUntil: values.validUntil || '',
    enterpriseId: values.enterpriseId || 0,
    deletable: values.deletable || false,
    editable: values.editable || false,
    brokers: values.brokers || [],
    products: values.products || []
  };
}

  private loadInstanceData(id:number): void {
    const sub = this.instanceService.getInstance(id).subscribe(instance => {
      this.instance = instance;
      console.log(this.instance);
    
    this.isTrueInsance=instance.hasIncentiveScheme;
    this.form.patchValue({
      name: instance.name || '',
      schemeType: instance.schemaType || '',
      ruleScope: instance.scope || '',
      hasIncentiveCategory: instance.hasIncentiveScheme ? this.translate.instant('IP.YES') : this.translate.instant('IP.NO'),
      brokerCategory: 'No aplica',
      isActive: instance.isActive ? this.translate.instant('IP.YES') : this.translate.instant('IP.NO'),
      percentage: instance.commissionPercentage || 0,
      fixedAmount: instance.commissionFixedAmount || 0,
      byBroker: instance.byBroker || false,
      byProduct: instance.byProduct || false,
      commissionSchemeId: instance.commissionSchemeId || 0,
      createdByUserId: instance.createdByUserId || 0,
      createdDate: instance.createdDate || '',
      lastUpdate: instance.lastUpdate || '',
      validFrom: instance.validFrom || '',
      validUntil: instance.validUntil || '',
      enterpriseId: instance.enterpriseId || 0,
      deletable: instance.deletable || false,
      editable: instance.editable || false,
      brokers: instance.brokers || [],
      products: instance.products || []
    });
      this.brokers=instance.brokers;
      this.products=instance.products;
      this.commissionSchemeId=instance.commissionSchemeId;
      this.brokerCategoryControl.setValue('No aplica');
      this.form.updateValueAndValidity();
      this.loadingService.setLoadingState(false);
    });
    this.subscription.add(sub);
  }
  onBack(): void {
    this.router.navigate(['schemes-instances-list'], { relativeTo: this.route });
  }
}
