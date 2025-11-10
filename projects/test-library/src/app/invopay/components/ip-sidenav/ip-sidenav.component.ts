import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer, MatDrawerMode } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Subscription,
  combineLatest,
  filter,
  firstValueFrom,
  take,
} from 'rxjs';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { FlowStatus } from '../../interfaces/Iip-flow-status';
import IpErrorResponse from '../../interfaces/ip-error-response';
import { IpPermissions } from '../../interfaces/ip-permissions';
import { FlowStatusService } from '../../services/flow-status.service';
import { IpAuthService } from '../../services/ip-auth.service';
import { IpInfoSharedCompanyService } from '../../services/ip-info-shared-company.service';
import { IpLicenceService } from '../../services/ip-licence.service';
import { IpRoleService } from '../../services/ip-role.service';
import { IpSnackbarService } from '../../services/ip-snackbar.service';
import { IpConfirmActionDialogComponent } from '../ip-confirm-action-dialog/ip-confirm-action-dialog.component';
import { IpPermissionResponse } from '../../interfaces/ip-permission-response';
import { PermissionType } from '../../interfaces/ip-permission-type';
import { IpSalesService } from '../../services/ip-sales.service';
import { IpProfileService } from '../../services/ip-profile.service';
import { MainMenuOptions, MenuOptions, SubmenuesOptions } from '../../interfaces/ip-enterprise-config-menu';

@Component({
  selector: 'app-ip-sidenav',
  templateUrl: './ip-sidenav.component.html',
  styleUrls: ['./ip-sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IpSidenavComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatDrawer;
  companyName!: string;
  type: 'business' | 'employee' | 'provider' = 'business';
  typeManager!: string;
  rolePermissions: IpPermissionResponse[] = []

  closed: boolean = true;
  pageTitle?: string;
  mode!: MatDrawerMode;
  companyLogo: string = 'assets/icons/logo_bp.svg';
  onRouteChangeSub: Subscription = new Subscription();
  themeConfigSub: Subscription = new Subscription();
  subscriptions: Subscription[] = [];
  pageTitleMap = new Map<string, string>([
    ['/invopay/admin/home', 'IP.SIDENAV.HOME'],
    //Invoice
    ['/invopay/admin/dashboard', 'IP.SIDENAV.OPTIONS.BILL'],
    ['/invopay/admin/manage-invoice', 'IP.SIDENAV.OPTIONS.BILL'],
    ['/invopay/admin/bill', 'IP.SIDENAV.OPTIONS.BILL'],
    ['/invopay/admin/new-invoice', 'IP.SIDENAV.OPTIONS.BILL'],
    ['/invopay/admin/payment-history', 'IP.SIDENAV.OPTIONS.BILL'],
    ['/invopay/admin/bill/details', 'IP.SIDENAV.OPTIONS.BILL'],
    ['/invopay/admin/invoice-report', 'IP.SIDENAV.OPTIONS.BILL'],
    ['/invopay/admin/renditions', 'IP.SIDENAV.OPTIONS.RENDITIONS'],
    ['/invopay/admin/rendition-report', 'IP.SIDENAV.OPTIONS.RENDITIONS'],
    ['/invopay/admin/payment-rendition', 'IP.SIDENAV.OPTIONS.RENDITIONS'],
    ['/invopay/admin/new-invoice', 'IP.SIDENAV.OPTIONS.BILL'],

    //Management
    ['/invopay/admin/supplier', 'IP.SIDENAV.OPTIONS.MANAGEMENT_SIDENAV'],
    ['/invopay/admin/active-contract', 'IP.SIDENAV.OPTIONS.MANAGEMENT_SIDENAV'],
    ['/invopay/admin/purchase', 'IP.SIDENAV.OPTIONS.MANAGEMENT_SIDENAV'],
    ['/invopay/admin/broker', 'IP.SIDENAV.OPTIONS.MANAGEMENT_SIDENAV'],
    ['/invopay/admin/enterprise-employees', 'IP.SIDENAV.OPTIONS.MANAGEMENT_SIDENAV'],

    ['/invopay/admin/pay-bill', 'IP.SIDENAV.OPTIONS.PAY-BILL'],

    [
      '/invopay/admin/accountability-details',
      'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.DETAILS',
    ],
    [
      'invopay/accountability-details-invoice',
      'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.DETAILS-INVOICE',
    ],
    ['/invopay/admin/accountability-new', 'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.NEW'],
    ['/invopay/admin/accountability-edit', 'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.EDIT'],
    [
      '/invopay/admin/accountability-observations',
      'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.OBSERVATIONS',
    ],
    [
      '/invopay/admin/accountability-observations-invoice',
      'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.OBSERVATIONS',
    ],

    ['/invopay/admin/enterprise-admins', 'IP.SIDENAV.OPTIONS.USER'],
    ['/invopay/admin/subsidiary-managers', 'IP.SIDENAV.OPTIONS.ENTERPRISE_ADMINS'],
    ['/invopay/admin/subsidiary-enterprises', 'IP.SIDENAV.OPTIONS.ENTERPRISE'],
    ['/invopay/admin/supplier-admins', 'IP.SIDENAV.OPTIONS.USER'],
    ['/invopay/admin/new-rendition', 'IP.SIDENAV.OPTIONS.NEW_RENDITION'],
    ['/invopay/admin/rendition-status', 'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.EDIT'],
    [
      '/invopay/admin/rendition-comments',
      'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.OBSERVATIONS',
    ],
    [
      '/invopay/admin/invoice-comments',
      'IP.SIDENAV.OPTIONS.ACCOUNTABILITY.OBSERVATIONS',
    ],
    ['/invopay/admin/management', 'IP.SIDENAV.OPTIONS.MANAGEMENT'],
    ['/invopay/admin/invoice-details', 'IP.SIDENAV.OPTIONS.PAYMENTS_DETAILS'],
    [
      '/invopay/admin/rendition-payment-details',
      'IP.SIDENAV.OPTIONS.RENDITION_PAYMENT_DETAILS',
    ],
    ['/invopay/admin/user-profile', 'IP.SIDENAV.OPTIONS.USER_PROFILE'],

    ['/invopay/admin/settlements', 'IP.SIDENAV.OPTIONS.SALES'],
    ['/invopay/admin/manage-settlements', 'IP.SIDENAV.OPTIONS.SALES'],
    ['/invopay/admin/invoiced-settlements', 'IP.SIDENAV.OPTIONS.SALES'],
    ['/invopay/admin/settlement-details', 'IP.SIDENAV.OPTIONS.SALES'],
    ['/invopay/admin/new-settlement', 'IP.SIDENAV.OPTIONS.SALES'],
    ['/invopay/admin/settlement-from-sale', 'IP.SIDENAV.OPTIONS.SALES'],
    ['/invopay/admin/consolidated-sales', 'IP.SIDENAV.OPTIONS.SALES'],
    ['/invopay/admin/consolidated-creation-sales', 'IP.SIDENAV.OPTIONS.SALES'],
    ['/invopay/admin/all-invoices', 'IP.SIDENAV.OPTIONS.SALES'],
    
    //======== New Module FINANCES ===============;
    ['/invopay/admin/finance/pay-invoices', 'IP.SIDENAV.OPTIONS.PAYMENTS'],
    ['/invopay/admin/finance/manage-pay-orders', 'IP.SIDENAV.OPTIONS.PAYMENTS'],

    ['/invopay/admin/finance/consolidated', 'IP.SIDENAV.OPTIONS.PAYMENTS'],
    ['/invopay/admin/finance/consolidated-detail', 'IP.SIDENAV.OPTIONS.PAYMENTS'],
    ['/invopay/admin/finance/paid-orders', 'IP.SIDENAV.OPTIONS.PAYMENTS'],
    ['/invopay/admin/finance/generated-orders', 'IP.SIDENAV.OPTIONS.PAYMENTS'],
    //Provider acc;
    ['/invopay/admin/finance/my-finance', 'IP.SIDENAV.OPTIONS.MY_FINANCE'],

    //Business acc;
    ['/invopay/admin/finance/provider-accounts', 'IP.SIDENAV.OPTIONS.FINANCE'],
    ['/invopay/admin/finance/payments-ongoing', 'IP.SIDENAV.OPTIONS.FINANCE'],
    ['/invopay/admin/finance/payments-done', 'IP.SIDENAV.OPTIONS.FINANCE'],
    //sales 
    ['/invopay/admin/sales-manage', 'IP.SIDENAV.OPTIONS.PRODUCTION'],
    ['/invopay/admin/sales-import', 'IP.SIDENAV.OPTIONS.PRODUCTION'],
    ['/invopay/admin/sales-error', 'IP.SIDENAV.OPTIONS.PRODUCTION'],
    ['/invopay/admin/sales-history', 'IP.SIDENAV.OPTIONS.PRODUCTION'],

    //consolidate
    ['/invopay/admin/consolidated-config', 'IP.SIDENAV.OPTIONS.CONSOLIDATED_TITLE'],
    ['/invopay/admin/consolidated-invoice', 'IP.SIDENAV.OPTIONS.PAYMENTS'],
    ['/invopay/admin/consolidated-rendition', 'IP.SIDENAV.OPTIONS.CONSOLIDATED_TITLE'],

    // pay in
    ['/invopay/admin/manage-payin', 'IP.SIDENAV.OPTIONS.PAY_IN'],
    ['/invopay/admin/consolidated-payin', 'IP.SIDENAV.OPTIONS.PAY_IN'],
    ['/invopay/admin/no-consolidated-payin', 'IP.SIDENAV.OPTIONS.PAY_IN'],
    ['/invopay/admin/payin-import', 'IP.SIDENAV.OPTIONS.PAY_IN'],

    ['/invopay/admin/pending-payment', 'IP.SIDENAV.OPTIONS.COLLECTION_OPTIONS.TITLE'],

  ]);
  exitItem = {
    img: 'assets/img/sidenav/cerrar session.svg',
    text: 'Sign off',
    link: '',
  };
  listItems!: any[];
  logoUrl?: string;
  permissions?: IpPermissions;
  flowStatuses?: FlowStatus[];
  currentUrl?: string;
  selectedItem: any = null;
  statusPayment: boolean = true
  private routeSubscription: Subscription | undefined;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private themeService: ThemeService,
    private roleService: IpRoleService,
    private authService: IpAuthService,
    private salesService: IpSalesService,
    private infoSharedCompany: IpInfoSharedCompanyService,
    private ipLicenceService: IpLicenceService,
    private flowStatusService: FlowStatusService,
    private ipSnackbarService: IpSnackbarService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog, 
    private profileservice: IpProfileService
  ) {
    this.updateMode(window.innerWidth);
  }
  activeRoute: string = '';

  async ngOnInit() {
    this.type = this.roleService.getType();
    this.typeManager = this.roleService.getUserType();
    await this.setRolePermissions();
    await firstValueFrom(this.profileservice.enterprise$.pipe(
    filter(v => v != null)
    ))
    this.routeSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateActiveItemBasedOnUrl());
    this.updateActiveItemBasedOnUrl();
    const permissionsAndFlowStatusesSubscription = combineLatest({
      businessPermissions: this.ipLicenceService.currentBusinessPermissions$,
      flowStatuses: this.flowStatusService.currentFlowStatuses$,
    })
      .pipe(
        filter(({ businessPermissions, flowStatuses }) => {
          return businessPermissions !== null && flowStatuses !== null;
        }),
        take(1) // Complete after the first valid emission
      )
      .subscribe({
        next: ({ businessPermissions, flowStatuses }) => {
          if (businessPermissions && flowStatuses) {
            this.permissions = businessPermissions.permissions;
            this.flowStatuses = flowStatuses;
            this.setStatusPayment()
            // Set sidenav items based on available sections
            this.listItems = this.setListItems();
            this.exitItem.text = this.translateService.instant(
              'IP.SIDENAV.OPTIONS.SIGN_OFF'
            );
            // // TODO: Whenever the language changes: set sidenav items again
            // this.translateService.onLangChange.subscribe(() => {
            //   this.listItems = this.setListItems();
            //   this.exitItem.text = this.translateService.instant(
            //     'IP.SIDENAV.OPTIONS.SIGN_OFF'
            //   );
            // });
          }
        },
        error: (e: IpErrorResponse) => {
          this.authService.logOut();
          this.ipSnackbarService.showErrorMessage(e);
        },
      });
    this.subscriptions.push(permissionsAndFlowStatusesSubscription);
    // this.getLogoCompany();
    this.themeConfigSub = this.themeService.currentConfigObj$.subscribe(
      (config) => {}
    );
    this.headerOnRouteChange();
    this.setTitle(this.router.url);
    this.logoUrl = sessionStorage.getItem('logoUrl')!;
    this.salesService.setExtraData();
  }

  ngOnDestroy(): void {
    this.themeConfigSub.unsubscribe();
    this.onRouteChangeSub.unsubscribe();
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  sidenav: boolean = false;

  onToggleSidenav() {
    this.sidenav = !this.sidenav;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.updateMode(event.target.innerWidth);
  }
  private updateMode(windowWidth: number) {
    if (windowWidth >= 768) {
      this.mode = 'side';
    } else {
      this.mode = 'over';
    }
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  toggleSubItems(item: any): void {
    this.listItems.forEach((i) => {
      if (i !== item) {
        i.showSubItems = false;
        i.isSelected = false;
      }
    });
    item.isSelected = !item.isSelected;
    item.showSubItems = item.isSelected && item.subItems?.length > 0;
    this.selectedItem = item.isSelected ? item : null;
    if (this.mode === 'over' && item.link) this.onToggleSidenav()
  }

  updateActiveItemBasedOnUrl(): void {
    this.managementItems.forEach((item) => {
      const isActive = item.subItems?.some((subItem: any) =>
        this.router.url.includes(subItem.link)
      );

      item.isSelected = !!isActive;
      item.showSubItems = !!isActive;
    });
  }
  isSubItemActive(item: any): boolean {
    return item.subItems?.some((subItem: any) =>
      this.router.url.includes(subItem.link)
    );
  }

  headerOnRouteChange() {
    this.onRouteChangeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.urlAfterRedirects;
        this.setTitle(currentRoute);
        this.ipSnackbarService.dismissNotStickyMessage();
      }
    });
  }

  setTitle(currentRoute: string) {
    const currentRouteArray = currentRoute.split(';');
    const currentBaseRouteArray = currentRouteArray[0].split('/');
    if (currentBaseRouteArray[2] === 'management') {
      this.pageTitle = this.pageTitleMap.get('/invopay/admin/management') || '';
    } else {
      this.pageTitle = this.pageTitleMap.get(currentRouteArray[0]) || '';
    }
  }

  open() {
    this.drawer.open();
    this.closed = false;
  }

  close() {
    this.drawer.close();
    this.closed = true;
  }

  setStatusPayment(){
    let isPaid = false
    if (this.flowStatuses){
      this.flowStatuses?.forEach(flowStatus =>{
        if (flowStatus.isPaid) isPaid = true
      })
    }
    this.statusPayment = isPaid
  }

  selectedSubItem: string | null = null;

  managementItems: any[] = [];
  setListItems(): any[] {
    switch (this.type) {
      case 'provider':
        this.managementItems = [
          {
            img: 'assets/new-styles/icons/sidebar/admins-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.USER'),
            link: '/invopay/admin/supplier-admins',
          },
        ]
        return [
          {
            img: 'assets/new-styles/icons/sidebar/home-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.HOME'),
            link: 'dashboard',
          },
          {
            img: 'assets/new-styles/icons/sidebar/invoices-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.BILL'),
            link: 'bill',
          },
          {
            img: 'assets/img/sidenav/finance.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.HISTORY'),
            link: 'payment-history',
          },
          ...(this.roleService.getIsBroker() ?
          [
            {
              img: 'assets/img/sidenav/ticket.svg',
              text: this.translateService.instant(
                'IP.SIDENAV.OPTIONS.SETTLEMENTS'
              ),
              link: 'settlements',
            },
          ]
        : []),
        ];
      case 'business':
        this.managementItems = [
          {
            img: 'assets/new-styles/icons/settings-icon.svg',
            text: this.translateService.instant(
              'IP.SIDENAV.OPTIONS.MANAGEMENT'
            ),
            link: '/invopay/admin/management/roles',
          },
          {
            img: 'assets/new-styles/icons/employees-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.EMPLOYEES'),
            link: '/invopay/admin/enterprise-employees',
          },
          {
            img: 'assets/new-styles/icons/sidebar/admins-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.USER'),
            link: '/invopay/admin/enterprise-admins',
          },
          {
            img: 'assets/img/header/language.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.ENTERPRISE'),
            link: '/invopay/admin/subsidiary-enterprises',
          },
          {
            img: 'assets/icons/user.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.ENTERPRISE_ADMINS'),
            link: '/invopay/admin/subsidiary-managers',
          },
        ];

        const listItems = [
          {
            img: 'assets/new-styles/icons/finances-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.PRODUCTION'),
            show: this.visibleMenu(['admin_sale'], 'commissions'),
            link: null,
            subItems: [
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.SALES_OPTIONS.MANAGE'
                ),
                link: 'sales-manage',
                show: this.visibleSubMenu('adminSales')
              },
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.SALES_OPTIONS.IMPORT'
                ),
                link: 'sales-import',
                show: this.visibleSubMenu('csvSales')
              },              
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.SALES_OPTIONS.HISTORY'
                ),
                link: 'sales-history',
                show: this.visibleSubMenu('historySales')
              },
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.SALES_OPTIONS.ERRORS'
                ),
                link: 'sales-error',
                show: this.visibleSubMenu('errorSales')
              },
            ],
          },
          {
            img: 'assets/new-styles/icons/payments.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.PAY_IN'),
            link: null,
            show: this.visibleMenu(['admin_pay_in'], 'payIn'),
            subItems: [
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.PAY_IN_OPTIONS.IMPORT'
                ),
                link: 'payin-import',
                show: this.visibleSubMenu( 'csvPayments')
              },
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.PAY_IN_OPTIONS.MANAGE'
                ),
                link: 'manage-payin',
                show: this.visibleSubMenu( 'adminPayments')
              },
            ],
          },
          {
            img: 'assets/new-styles/icons/finances-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.SALES'),
            show: this.visibleMenu(['admin_settlement'], 'commissions'),
            link: null,
            subItems: [
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.SETTLEMENTS_OPTIONS.CREATE'
                ),
                link: 'settlement-from-sale',
                show: this.visibleSubMenu('createSettlements')
              },
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.SETTLEMENTS_OPTIONS.MANAGE'
                ),
                link: 'manage-settlements',
                show: this.visibleSubMenu('adminSettlements')
              },
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.PAY_IN_OPTIONS.CONCILIATED_TO_PAY'
                ),
                link: 'consolidated-sales',
                show: this.visibleSubMenu( 'conciliateSalesPayments')
              },
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.ALL_INVOICES'
                ),
                link: 'all-invoices',
                show: this.visibleSubMenu('invoicedSettlements')
              },
            ],
          },
          {
            img: 'assets/new-styles/icons/payments.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.PAYMENTS'),
            link: null,
            show: this.visibleMenu(['admin_pay_out'], 'payOut'),
            subItems: [
              {line: true, show: false, titleLine:'Facturación'},
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.DASHBOARD'
                ),
                link: 'dashboard',
                show: this.visibleSubMenu('dashboardInvoices')
              },
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.INVOICE_OPTIONS.MANAGE'
                ),
                link: 'manage-invoice',
                show: this.visibleSubMenu('adminInvoices')
              },
              {line: true, show: false, titleLine:'Ordenes de pago'},
              {
                img: '',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.PAY_INVOICES'
                ),
                link: 'finance/pay-invoices',
                show: this.visibleSubMenu('createPayOrders')
              },
              {
                img: '',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.FINANCES_OPTIONS.MANAGE'
                ),
                link: 'finance/manage-pay-orders',
                show: this.visibleSubMenu('adminPayOrders')
              },
            ],
          },
          {
            img: 'assets/new-styles/icons/sidebar/invoices-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.COLLECTION_OPTIONS.TITLE'),
            link: null,
            show: this.visibleMenu(['admin_collection'], 'collections'),
            subItems: [
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.COLLECTION_OPTIONS.PENDING_PAYMENTS'
                ),
                link: 'pending-payment',
                show: this.visibleSubMenu('pendingPayments')
              },
            ],
          },
          {line: true, show: this.visibleLine(['admin_configuration'], 'configurations')},
          {
            img: 'assets/new-styles/icons/settlements-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.CONSOLIDATED_TITLE'),
            link: null,
            show: this.visibleMenu(['admin_configuration'], 'configurations'),
            subItems: [
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.CONSOLIDATED_OPTIONS.CONFIG'
                ),
                link: 'consolidated-config',
                show: this.visibleSubMenu('configConciliation')
              },
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.CONSOLIDATED_OPTIONS.RENDITION_PAYMENT'
                ),
                link: 'consolidated-rendition',
                show: this.visibleSubMenu( 'conciliateRenditionPayment')
              },
            ],
          },
          {line: true, show: this.visibleLine(['admin_renditions'], 'renditions')},
          {
            img: 'assets/new-styles/icons/book.svg',
            text: this.translateService.instant(
              'IP.SIDENAV.OPTIONS.RENDITIONS'
            ),
            show: this.visibleMenu(['admin_renditions'], 'renditions'),
            link: null,
            subItems: [
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.RENDITIONS'
                ),
                link: 'renditions',
                show: this.visibleSubMenu('inProgressRenditions')
              },
              {
                img: 'assets/img/sidenav/alert.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.REPORTED'
                ),
                link: 'rendition-report',
                show: this.visibleSubMenu('reportedRenditions')
              },
              {
                img: 'assets/img/sidenav/finance.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.PAID'
                ),
                link: 'payment-rendition',
                show: this.statusPayment && this.visibleSubMenu('paidRenditions')
              },
            ],
          },
          {line: true, show: this.visibleLine(['admin_management'], 'admin'),},
          {
            img: 'assets/new-styles/icons/management-icon.svg',
            text: this.translateService.instant(
              'IP.SIDENAV.OPTIONS.MANAGEMENT_SIDENAV'
            ),
            link: null,
            show: this.visibleMenu(['admin_management'], 'admin'),
            subItems: [
              {
                img: 'assets/icons/user.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.SUPPLIER'
                ),
                link: 'supplier',
                show: this.visibleSubMenu('adminProviders')
              },
              {
                img: 'assets/icons/user.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.BROKER'
                ),
                link: 'broker',
                show: this.visibleSubMenu('adminBrokers')
              },
              {
                img: 'assets/icons/user.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.EMPLOYEE'
                ),
                link: 'enterprise-employees',
                show: this.visibleSubMenu('adminEmployees')
              },
              {
                img: 'assets/img/sidenav/active-contract.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.NEW_ACTIVE-CONTRACT'
                ),
                link: 'active-contract',
                show: this.visibleSubMenu('adminContracts')
              },
              {
                img: 'assets/img/sidenav/ticket.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.PURCHASE'
                ),
                link: 'purchase',
                show: this.visibleSubMenu('adminSaleOrders')
              },
            ],
          },
          // {
          //   img: 'assets/new-styles/icons/sidebar/finances-icon.svg',
          //   text: this.translateService.instant('IP.SIDENAV.OPTIONS.FINANCE'),
          //   link: null,
          //   subItems: [
          //     {
          //       text: this.translateService.instant(
          //         'IP.SIDENAV.OPTIONS.FINANCES_OPTIONS.PROVIDER_ACCS'
          //       ),
          //       link: 'finance/provider-accounts',
          //     },
          //     {
          //       text: this.translateService.instant(
          //         'IP.SIDENAV.OPTIONS.FINANCES_OPTIONS.PAYMENTS_DONE'
          //       ),
          //       link: 'finance/payments-done',
          //     },
          //     {
          //       text: this.translateService.instant(
          //         'IP.SIDENAV.OPTIONS.FINANCES_OPTIONS.PAYMENTS_ONGOING'
          //       ),
          //       link: 'finance/payments-ongoing',
          //     },
          //   ],
          // },
        ];
        // if (this.flowStatuses) {
        //   let canSeePaidOnes = false;
        //   this.flowStatuses.forEach((flowStatus) => {
        //     if (flowStatus.isPaid) {
        //       canSeePaidOnes = true;
        //     }
        //   });
        //   if (canSeePaidOnes) {
        //     listItems.splice(4, 0, {
        //       img: 'assets/img/sidenav/finance.svg',
        //       text: this.translateService.instant('IP.SIDENAV.OPTIONS.HISTORY'),
        //       link: 'payment-history',
        //     });
        //   }
        // }
        // if (
        //   !this.permissions ||
        //   this.permissions.maxEmployees === undefined ||
        //   this.permissions.maxEmployees > 0
        // ) {
        //   listItems.splice(2, 0, {
        //     img: 'assets/new-styles/icons/sidebar/book.svg',
        //     text: this.translateService.instant(
        //       'IP.SIDENAV.OPTIONS.RENDITIONS'
        //     ),
        //     show: this.visibleMenu(['admin_renditions']),
        //     link: null,
        //     subItems: [
        //       {
        //         text: this.translateService.instant(
        //           'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.RENDITIONS'
        //         ),
        //         link: 'renditions',
        //       },
        //       {
        //         img: 'assets/img/sidenav/alert.svg',
        //         text: this.translateService.instant(
        //           'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.REPORTED'
        //         ),
        //         link: 'rendition-report',
        //       },
        //       {
        //         img: 'assets/img/sidenav/finance.svg',
        //         text: this.translateService.instant(
        //           'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.PAID'
        //         ),
        //         link: 'payment-rendition',
        //         show: this.statusPayment
        //       },
        //     ],
        //   },);
        // }

        return listItems;
      case 'employee':
        return [
          {
            img: 'assets/new-styles/icons/sidebar/home-icon.svg',
            text: this.translateService.instant('IP.SIDENAV.OPTIONS.HOME'),
            link: 'dashboard',
          },
          {
            img: 'assets/new-styles/icons/sidebar/book.svg',
            text: this.translateService.instant(
              'IP.SIDENAV.OPTIONS.RENDITIONS'
            ),
            link: null,
            subItems: [
              {
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.RENDITIONS'
                ),
                link: 'renditions',
              },
              {
                img: 'assets/img/sidenav/alert.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.REPORTED'
                ),
                link: 'rendition-report',
              },
              {
                img: 'assets/img/sidenav/finance.svg',
                text: this.translateService.instant(
                  'IP.SIDENAV.OPTIONS.RENDITIONS_OPTIONS.PAID'
                ),
                link: 'payment-rendition',
              },
            ],
          },
        ];
      default:
        return [];
    }
  }

  async exit() {
    const dialogRef = this.dialog.open(IpConfirmActionDialogComponent, {
      data: {
        question: '¿Confirma que desea cerrar sesión',
        id: '',
      },
    });
    const actionConfirmed = await firstValueFrom(dialogRef.afterClosed());
    if (actionConfirmed) {
      this.authService.logOut();
      this.headerOnRouteChange();
    }
  }

  stopModalClose(event: MouseEvent) {
    event.stopPropagation(); // Previene que el clic cierre el modal si es en un item con subitems
  }

  async setRolePermissions(){
    const userType = this.roleService.getUserType();
    if (this.type === 'business' && userType !== 'ENTERPRISE_MANAGER' && userType !== 'ENTERPRISE_ADMIN'){
      let role = this.authService.getUserRole()
      if (role === undefined) {
        role = await firstValueFrom(this.roleService.getUserPermission())
        this.authService.setUserRole(role)
      }
      if (role.permissions) {
        this.rolePermissions = role.permissions
        //this.router.navigateByUrl(`/invopay/admin/${this.rolePermissions.sort((a,b)=>a.id!-b.id!)[0].component}`)
      }      
    }
  }

  visibleMenu(permission: PermissionType[], option: MainMenuOptions):boolean {
    let isVisible = true
    if (this.profileservice.enterpriseMeuConfig.length > 0){ 
      isVisible = this.profileservice.enterpriseMeuConfig.some(conf => this.subMenues[option].includes(conf))
    }
    if (isVisible && this.rolePermissions.length > 0){
      isVisible = permission.some(perm => this.rolePermissions.some(rolePerm => rolePerm.name === perm))      
    }
    return isVisible;
  }

  visibleSubMenu( option: MenuOptions):boolean{
    let isVisible = true 
    if (this.profileservice.enterpriseMeuConfig.length > 0){ 
      isVisible = this.profileservice.enterpriseMeuConfig.includes(option)
    }
    return isVisible;
  }

  visibleLine(permission: PermissionType[], option: MainMenuOptions):boolean {
    let isVisible = true
    if (this.rolePermissions.length > 0){
      isVisible = permission.some(perm => this.rolePermissions.some(rolePerm => rolePerm.name === perm)) 
      && this.rolePermissions.length > 1 
      && this.profileservice.enterpriseMeuConfig.some(conf => this.subMenues[option].includes(conf))
    } else {
      isVisible = this.profileservice.enterpriseMeuConfig.some(conf => this.subMenues[option].includes(conf))
    }
    return isVisible;
  } 

  subMenues: SubmenuesOptions = {
    sales: [],
    payIn:  [ 'csvPayments','adminPayments' ],
    commissions:  [ 'adminSales','csvSales','historySales','errorSales'],
    settlements:  [ 'createSettlements','adminSettlements','conciliateSalesPayments','invoicedSettlements' ],
    payOut:  [ 'dashboardInvoices','adminInvoices','createPayOrders','adminPayOrders' ],
    collections:  [ 'pendingPayments'],
    configurations:  [ 'configConciliation','conciliateRenditionPayment' ],
    renditions:  ['inProgressRenditions','reportedRenditions','paidRenditions'],
    admin:  ['adminProviders','adminBrokers','adminEmployees','adminContracts','adminSaleOrders' ],
    brokers: ['manageBrokers']
  } 
}
