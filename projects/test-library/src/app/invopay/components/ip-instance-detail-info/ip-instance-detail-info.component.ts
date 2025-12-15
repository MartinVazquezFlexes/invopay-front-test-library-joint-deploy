import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { BrokerCategory, Product, InsurancePolicies } from '../../interface/ip-instance-detail';
import { CardConfig } from '../../../shared/models/movile-table';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, combineLatest } from 'rxjs';
import { CustomDatePipe } from '../../../shared/Utils/pipeCustomDate';
import { CurrencySymbolPipe } from '../../../shared/Utils/currency-simbol-pipe';
import { AmountFormatPipe } from '../../../shared/Utils/amount-format-pipe.pipe';

@Component({
  selector: 'app-ip-instance-detail-info',
  templateUrl: './ip-instance-detail-info.component.html',
  styleUrls: ['./ip-instance-detail-info.component.scss']
})
export class IpInstanceDetailInfoComponent implements OnInit {
  @Input() brokers:BrokerCategory[]=[];
  @Input() products:Product[]=[];
  @Input() insurancePolicies:InsurancePolicies[]=[];
  @Input() general:string='';
  activeTab: 'products' | 'brokers' | 'policies' = 'products';
  policies: InsurancePolicies[] = [];
  
  titlesFile = new Map<string, string>();
  initTable = false;
  mobileCardConfig!: CardConfig;
  private subscription = new Subscription();
  private cdr=inject(ChangeDetectorRef)
  private customDatePipe = inject(CustomDatePipe);
  private currencySymbolPipe = inject(CurrencySymbolPipe);
   private readonly amountPipe=inject(AmountFormatPipe)
  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadData();
    this.setupTranslations();
    this.setupMobileConfig();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

 
  loadData(): void {
    this.policies = this.insurancePolicies || [];
  }

  private setupTranslations(): void {
    this.subscription.add(
      this.translate.onLangChange.subscribe(() => {
        this.setupTranslations();
      })
    );
    
    this.updateTranslations();
  }

  private updateTranslations(): void {
    switch (this.activeTab) {
      case 'products':
        this.setupProductsTranslations();
        break;
      case 'brokers':
        this.setupBrokersTranslations();
        break;
      case 'policies':
        this.setupPoliciesTranslations();
        break;
    }
  }

  private setupProductsTranslations(): void {
    const translationKeys = [
      'IP.COMISSION_SCHEME.TABLE.NAME',
      'IP.COMISSION_SCHEME.TABLE.DESCRIPTION',
      'IP.COMISSION_SCHEME.TABLE.TYPE',
      'IP.COMISSION_SCHEME.TABLE.ACTIVE'
    ];

    const translationObservables = translationKeys.map(key => this.translate.get(key));

    this.subscription.add(
      combineLatest(translationObservables).subscribe((translations: string[]) => {
        const titlesMap = new Map<string, string>([
          ['name', translations[0]],
          ['description', translations[1]],
          ['type', translations[2]],
          ['isActiveText', translations[3]]
        ]);
        
        this.titlesFile = titlesMap;
        this.cdr.detectChanges();
      })
    );
  }

  private setupBrokersTranslations(): void {
    const translationKeys = [
      'IP.COMISSION_SCHEME.TABLE.BROKER_NAME',
      'IP.COMISSION_SCHEME.TABLE.BROKER_EMAIL',
      'IP.COMISSION_SCHEME.TABLE.CREATION_DATE',
      'IP.COMISSION_SCHEME.TABLE.LAST_LOGIN'
    ];

    const translationObservables = translationKeys.map(key => this.translate.get(key));

    this.subscription.add(
      combineLatest(translationObservables).subscribe((translations: string[]) => {
        const titlesMap = new Map<string, string>([
          ['brokerName', translations[0]],
          ['brokerEmail', translations[1]],
          ['creationDate', translations[2]],
          ['lastLogin', translations[3]]
        ]);
        
        this.titlesFile = titlesMap;
        this.cdr.detectChanges();
      })
    );
  }

  private setupPoliciesTranslations(): void {
    const translationKeys = [
      'IP.COMISSION_SCHEME.TABLE.NAME',
      'IP.COMISSION_SCHEME.TABLE.BROKER',
      'IP.COMISSION_SCHEME.TABLE.AMOUNT',
      'IP.COMISSION_SCHEME.TABLE.STATUS',
      'IP.COMISSION_SCHEME.TABLE.POLICY_NUMBER',
      'IP.COMISSION_SCHEME.TABLE.CUSTOMER_NAME',
      'IP.COMISSION_SCHEME.TABLE.EMISSION_DATE'
    ];

    const translationObservables = translationKeys.map(key => this.translate.get(key));

    this.subscription.add(
      combineLatest(translationObservables).subscribe((translations: string[]) => {
        const titlesMap = new Map<string, string>([
          ['name', translations[0]],
          ['brokerName', translations[1]],
          ['amount', translations[2]],
          ['status', translations[3]],
          ['policyNumber', translations[4]],
          ['customerName', translations[5]],
          ['emissionDate', translations[6]]
        ]);
        
        this.titlesFile = titlesMap;
        this.cdr.detectChanges();
      })
    );
  }

  yesNoTranslator(value: boolean): string {
    return value ? this.translate.instant('COMMON.YES') : this.translate.instant('COMMON.NO');
  }
  statusTranslate(value:string):string{
    if(value==="ACTIVE"){
      return this.translate.instant('IP.COMISSION_SCHEME.TABLE.ACTIVE')
    }
    else{
      return this.translate.instant('IP.COMISSION_SCHEME.TABLE.INACTIVE')
    }
  }

  private formatLastLoginDate(dateString: string | null | Date): string {
    if (!dateString) return '';
    
    try {
      if (dateString instanceof Date) {
        const utcHours = dateString.getUTCHours();
        const argentinaHours = (utcHours - 3 + 24) % 24; 
        
        const day = String(dateString.getUTCDate()).padStart(2, '0');
        const month = String(dateString.getUTCMonth() + 1).padStart(2, '0');
        const year = dateString.getUTCFullYear();
        const hours = String(argentinaHours).padStart(2, '0');
        const minutes = String(dateString.getUTCMinutes()).padStart(2, '0');
        const seconds = String(dateString.getUTCSeconds()).padStart(2, '0');
        
        return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
      }
      
      if (typeof dateString === 'string') {
        const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (isoMatch) {
          const [, year, month, day, hours, minutes, seconds] = isoMatch;
          
          const utcHour = parseInt(hours);
          const argentinaHour = (utcHour - 3 + 24) % 24;
          
          return `${day}/${month}/${year} - ${String(argentinaHour).padStart(2, '0')}:${minutes}:${seconds}`;
        }
      }
      
      return '';
    } catch (error) {
      return '';
    }
  }

  getCurrentData() {
    
    switch (this.activeTab) {
      case 'products': 
        return this.products.map(product => ({
          ...product,
          isActiveText: this.yesNoTranslator(product.isActive)
        }));
      case 'brokers': 
        console.log('Returning brokers data, count:', this.brokers.length);
        return this.brokers.map(broker => ({
          brokerName: broker.username,
          brokerEmail: broker.userEmail,
          creationDate: this.customDatePipe.transform(broker.userCreationDate),
          lastLogin: this.formatLastLoginDate(broker.lastLoginDate),
          id: broker.id
        }));
      case 'policies': 
        return this.policies.map(policy => ({
          name: policy.name,
          brokerName: policy.brokerName,
          amount: this.amountPipe.transform(policy.amount,true,'',policy.currency
          ) ,
          status: this.statusTranslate(policy.status),
          policyNumber: policy.policyNumber,
          customerName: policy.customerName,
          emissionDate: this.customDatePipe.transform(policy.emissionDate),
          id: policy.id
        }));
      default: return [];
    }
  }

  getCurrentConfig() {
    switch (this.activeTab) {
      case 'products':
        return { columns: ['name', 'description', 'type', 'isActiveText'] };
      case 'brokers':
        return { columns: ['brokerName', 'brokerEmail', 'creationDate', 'lastLogin'] };
      case 'policies':
        return { columns: ['name', 'brokerName', 'amount', 'status', 'policyNumber', 'customerName', 'emissionDate'] };
      default: 
        return { columns: [] };
    }
  }

  getCurrentTitlesFile() {
    return this.titlesFile;
  }

  setActiveTab(tab: 'products' | 'brokers' | 'policies'): void {
    this.activeTab = tab;
    
    this.titlesFile = new Map<string, string>();
    
    
    
    this.updateTranslations();
    this.setupMobileConfig();
    
    this.cdr.detectChanges();
  }

  private setupMobileConfig(): void {
    switch (this.activeTab) {
      case 'products':
        this.mobileCardConfig = {
          headerKey: 'id',
          headerLabel: '#',
          fields: [
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.NAME'),
              key: 'name',
              highlight: true
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.DESCRIPTION'), 
              key: 'description'
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.TYPE'), 
              key: 'type'
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.ACTIVE'), 
              key: 'isActiveText',
              isStatus: true
            }
          ],
          showActionButton: false
        };
        break;
      case 'brokers':
        this.mobileCardConfig = {
          headerKey: 'id',
          headerLabel: '#',
          fields: [
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.BROKER_NAME'),
              key: 'brokerName',
              highlight: true
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.BROKER_EMAIL'), 
              key: 'brokerEmail'
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.CREATION_DATE'), 
              key: 'creationDate'
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.LAST_LOGIN'), 
              key: 'lastLogin'
            }
          ],
          showActionButton: false
        };
        break;
      case 'policies':
        this.mobileCardConfig = {
          headerKey: 'id',
          headerLabel: '#',
          fields: [
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.NAME'),
              key: 'name',
              highlight: true
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.BROKER'), 
              key: 'brokerName'
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.AMOUNT'), 
              key: 'amount',
              isAmountBold: true
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.STATUS'), 
              key: 'status',
              isStatus: true
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.POLICY_NUMBER'), 
              key: 'policyNumber'
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.CUSTOMER_NAME'), 
              key: 'customerName'
            },
            { 
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.EMISSION_DATE'), 
              key: 'emissionDate'
            }
          ],
          showActionButton: false
        };
        break;
    }
  }
}
