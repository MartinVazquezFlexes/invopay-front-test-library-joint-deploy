import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { BrokerCategory, Product, Policy } from '../../interface/ip-instance-detail';
import { CardConfig } from '../../../shared/models/movile-table';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, combineLatest } from 'rxjs';
import { CustomDatePipe } from '../../../shared/Utils/pipeCustomDate';

@Component({
  selector: 'app-ip-instance-detail-info',
  templateUrl: './ip-instance-detail-info.component.html',
  styleUrls: ['./ip-instance-detail-info.component.scss']
})
export class IpInstanceDetailInfoComponent implements OnInit {
  @Input() brokers:BrokerCategory[]=[];
  @Input() products:Product[]=[];
  
  activeTab: 'products' | 'brokers' | 'policies' = 'products';
  policies: Policy[] = [];
  
  titlesFile = new Map<string, string>();
  initTable = false;
  mobileCardConfig!: CardConfig;
  private subscription = new Subscription();
  private cdr=inject(ChangeDetectorRef)
  private customDatePipe = inject(CustomDatePipe);
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
 
    this.policies = [
      { 
        id: '1',
        number: 'POL-001-2024'
      },
      { 
        id: '2',
        number: 'POL-002-2024'
      },
      { 
        id: '3',
        number: 'POL-003-2024'
      },
      { 
        id: '4',
        number: 'POL-004-2024'
      },
      { 
        id: '5',
        number: 'POL-005-2024'
      }
    ];
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
      'IP.COMISSION_SCHEME.TABLE.POLICY_NUMBER'
    ];

    const translationObservables = translationKeys.map(key => this.translate.get(key));

    this.subscription.add(
      combineLatest(translationObservables).subscribe((translations: string[]) => {
        const titlesMap = new Map<string, string>([
          ['number', translations[0]]
        ]);
        
        this.titlesFile = titlesMap;
        this.cdr.detectChanges();
      })
    );
  }

  yesNoTranslator(value: boolean): string {
    return value ? this.translate.instant('COMMON.YES') : this.translate.instant('COMMON.NO');
  }

  getCurrentData() {
    switch (this.activeTab) {
      case 'products': 
        return this.products.map(product => ({
          ...product,
          isActiveText: this.yesNoTranslator(product.isActive)
        }));
      case 'brokers': 
        return this.brokers.map(broker => ({
          brokerName: broker.username,
          brokerEmail: broker.userEmail,
          creationDate: this.customDatePipe.transform(broker.userCreationDate),
          lastLogin: this.customDatePipe.transformDateTime(broker.lastLoginDate),
          id: broker.id
        }));
      case 'policies': return this.policies;
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
        return { columns: ['number'] };
      default: 
        return { columns: [] };
    }
  }

  getCurrentTitlesFile() {
    return this.titlesFile;
  }

  setActiveTab(tab: 'products' | 'brokers' | 'policies'): void {
    this.activeTab = tab;
    this.updateTranslations();
    this.setupMobileConfig();
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
              isAmount: true
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
              label: this.translate.instant('IP.COMISSION_SCHEME.TABLE.POLICY_NUMBER'),
              key: 'number',
              highlight: true
            }
          ],
          showActionButton: false
        };
        break;
    }
  }
}
