import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatDrawerMode, MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {combineLatest, filter, firstValueFrom, Subscription, take,} from 'rxjs';
import {ThemeService} from 'src/app/shared/services/theme.service';
import {FlowStatus} from '../../interfaces/Iip-flow-status';
import IpErrorResponse from '../../interfaces/ip-error-response';
import {IpPermissions} from '../../interfaces/ip-permissions';
import {FlowStatusService} from '../../services/flow-status.service';
import {IpAuthService} from '../../services/ip-auth.service';
import {IpLicenceService} from '../../services/ip-licence.service';
import {IpRoleService} from '../../services/ip-role.service';
import {IpSnackbarService} from '../../services/ip-snackbar.service';
import {IpConfirmActionDialogComponent} from '../ip-confirm-action-dialog/ip-confirm-action-dialog.component';
import {IpPermissionResponse} from '../../interfaces/ip-permission-response';
import {IpProfileService} from '../../services/ip-profile.service';
import {LicenceType} from "../../interfaces/ip-licence-type";
import CurrencyResponse from "../../interfaces/ip-currency-response";
import {IpCurrencyService} from "../../services/ip-currency.service";
import {IpEnterpriseService} from "../../services/ip-enterprise.service";
import {LoadingService} from "../../../shared/services/loading.service";
import { MainMenuOptions, MenuOptions, SubmenuesOptions } from '../../interfaces/ip-enterprise-config-menu';
import { PermissionType } from '../../interfaces/ip-permission-type';

@Component({
  selector: 'app-ip-header-v2',
  templateUrl: './ip-header-v2.component.html',
  styleUrls: ['./ip-header-v2.component.scss']
})
export class IpHeaderV2Component implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav
  @ViewChild('sidenav', {read: ElementRef}) sidenavRef!: ElementRef;
  @ViewChild('matSidenavContainer') sidenavContainer!: MatSidenavContainer;
  type: 'business' | 'employee' | 'provider' = 'business';
  typeManager!: string;
  rolePermissions: IpPermissionResponse[] = []

  pageTitle?: string;
  mode!: MatDrawerMode;
  onRouteChangeSub: Subscription = new Subscription();
  themeConfigSub: Subscription = new Subscription();
  subscriptions: Subscription[] = [];

  exitItem = {
    img: 'assets/img/sidenav/cerrar session.svg',
    text: this.translateService.instant('IP.SIDENAV.OPTIONS.LOGOUT'),
    link: '',
  };
  listItems!: any[];
  logoUrl?: string;
  permissions?: IpPermissions;
  flowStatuses?: FlowStatus[];
  selectedItem: any = null;
  statusPayment: boolean = true

  userName: string = '';
  userType?: 'business' | 'employee' | 'provider';
  userFriendlyType?: string;
  businessName?: string;
  licenceType?: LicenceType;
  isLicencePersonalized: boolean = false;
  currencies?: CurrencyResponse[];
  businessToProvide?: string;
  lastMouseX = 0;
  lastMouseY = 0;

  private loadingActive: boolean = false;

  constructor(
    private loadingService: LoadingService,
    private translateService: TranslateService,
    private router: Router,
    private themeService: ThemeService,
    private roleService: IpRoleService,
    private authService: IpAuthService,
    private ipLicenceService: IpLicenceService,
    private flowStatusService: FlowStatusService,
    private ipSnackbarService: IpSnackbarService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private profileservice: IpProfileService,
    private ipRoleService: IpRoleService,
    private ipCurrencyService: IpCurrencyService,
    private enterpriseService: IpEnterpriseService,
  ) {}

  async ngOnInit() {
    this.listItems = this.setListItems();
    //org
    this.onResize();
    this.type = this.roleService.getType();
    this.typeManager = this.roleService.getUserType();
    await this.setRolePermissions();
    await firstValueFrom(this.profileservice.enterprise$.pipe(
      filter(v => v != null)
    ))
    this.updateActiveItemBasedOnUrl();
    const permissionsAndFlowStatusesSubscription = combineLatest({
      businessPermissions: this.ipLicenceService.currentBusinessPermissions$,
      flowStatuses: this.flowStatusService.currentFlowStatuses$,
    })
      .pipe(
        filter(({businessPermissions, flowStatuses}) => {
          return businessPermissions !== null && flowStatuses !== null;
        }),
        take(1) // Complete after the first valid emission
      )
      .subscribe({
        next: ({businessPermissions, flowStatuses}) => {
          if (businessPermissions && flowStatuses) {
            this.permissions = businessPermissions.permissions;
            this.flowStatuses = flowStatuses;
            this.setStatusPayment()
            // Set sidenav items based on available sections
            this.listItems = this.setListItems();
            this.exitItem.text = this.translateService.instant(
              'IP.SIDENAV.OPTIONS.SIGN_OFF'
            );
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
      (config) => {
      }
    );
    this.headerOnRouteChange();
    this.logoUrl = sessionStorage.getItem('logoUrl')!;
    //


    this.userName = sessionStorage.getItem('username')!;
    this.businessName = sessionStorage.getItem('businessName')!;
    this.userType = this.ipRoleService.getType();
    //this.type = this.ipRoleService.getUserType();
    this.userFriendlyType = this.ipRoleService.getUserFriendlyType();
    this.ipCurrencyService.currencies$.subscribe((currencies) => {
      if (currencies) {
        this.currencies = currencies;
      }
    });
    this.getLicence();

    if (this.userType === 'provider') {
      this.setEnterpriseName();
    }

    this.subscriptions.push(
      this.loadingService.isLoading$.subscribe((loading) => {
        this.loadingActive = loading;

        this.closeExpandedWhenLoading();
      })
    );
  }

  private closeExpandedWhenLoading = () => {
    // change to enum o string
    if (!this.isMobile && !this.sidenavOpened && this.isExpanded && !this.isMouseOverSidenav()) {
      this.isExpanded = false;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }


  private isMouseOverSidenav(): boolean {
    if (!this.sidenavRef?.nativeElement) return false;

    const rect = this.sidenavRef.nativeElement.getBoundingClientRect();
    return (
      this.lastMouseX >= rect.left &&
      this.lastMouseX <= rect.right &&
      this.lastMouseY >= rect.top &&
      this.lastMouseY <= rect.bottom
    );
  }

  getLicence() {
    this.subscriptions.push(
      this.ipLicenceService.currentLicenceType$.subscribe({
        next: (licenceType) => {
          if (licenceType) {
            this.licenceType = licenceType;
          }
        },
      })
    );
    this.subscriptions.push(
      this.ipLicenceService.currentBusinessPermissions$.subscribe({
        next: (businessPermissions) => {
          if (businessPermissions) {
            this.isLicencePersonalized = businessPermissions.isPersonalized;
          }
        },
      })
    );
  }

  setEnterpriseName(): void {
    const enterpriseId = sessionStorage.getItem('enterpriseId');
    if (!enterpriseId) return;

    this.subscriptions.push(
      this.enterpriseService.getEnterpriseById(enterpriseId).subscribe({
        next: (enterprise) => {
          this.businessToProvide = enterprise.businessName;
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.themeConfigSub.unsubscribe();
    this.onRouteChangeSub.unsubscribe();
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
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
        this.ipSnackbarService.dismissNotStickyMessage();
      }
    });
  }

  isMobile = false;
  sidenavOpened = false;
  isExpanded = false;

  onCloseSidenav(item: any) {
    this.toggleSubItems(item);
    if (this.isMobile) {
      this.closeWhenNotSubItems(item);
    }
  }

  toggleSubItems(itemSelected: any): void {
    this.closeSubMenuNotSelected(itemSelected);
    itemSelected.isSelected = !itemSelected.isSelected;
    itemSelected.showSubItems = itemSelected.isSelected && itemSelected.subItems?.length > 0;
    this.selectedItem = itemSelected.isSelected ? itemSelected : null;
    
  }

  onCloseSidenav2(item: any) {
    this.toggleSubItems2(item);
    if (this.isMobile) {
      this.sidenavOpened = false;
      this.sidenav?.close();
    }
  }

  toggleSubItems2(itemSelected: any): void {
    this.closeSubMenuNotSelected(itemSelected)
    itemSelected.isSelected = true;
    itemSelected.showSubItems = itemSelected.isSelected && itemSelected.subItems?.length > 0;
    this.selectedItem = itemSelected.isSelected ? itemSelected : null;
  }

  private closeWhenNotSubItems = (item: any) => {
    if (!item?.subItems || item?.subItems?.length === 0) {
      this.sidenavOpened = false;
      this.sidenav?.close();
    }
  }

  setStatusPayment() {
    let isPaid = false
    if (this.flowStatuses) {
      this.flowStatuses?.forEach(flowStatus => {
        if (flowStatus.isPaid) isPaid = true
      })
    }
    this.statusPayment = isPaid
  }

  managementItems: any[] = [];

  setListItems(): any[] {
    this.managementItems = [
      {
        img: 'assets/icons/settings-icon.svg',
        text: this.translateService.instant(
          'IP.SIDENAV.OPTIONS.MANAGEMENT'
        ),
        link: '/invopay/management/roles',
      },
      {
        img: 'assets/icons/admins-icon.svg',
        text: this.translateService.instant('IP.SIDENAV.OPTIONS.USER'),
        link: '/invopay/enterprise-admins',
      },
      {
        img: 'assets/icons/language.svg',
        text: this.translateService.instant('IP.SIDENAV.OPTIONS.ENTERPRISE'),
        link: '/invopay/subsidiary-enterprises',
      },
      {
        img: 'assets/icons/user.svg',
        text: this.translateService.instant('IP.SIDENAV.OPTIONS.ENTERPRISE_ADMINS'),
        link: '/invopay/subsidiary-managers',
      },
    ];
    const listItems = [
      {
        img: 'assets/new-styles/icons/sidebar/home-icon.svg',
        text: this.translateService.instant('IP.SIDENAV.OPTIONS.HOME'),
        link: 'home',
      },
      {
        img: 'assets/icons/group_people.svg',
        text: this.translateService.instant(
          'IP.SIDENAV.OPTIONS.BROKER'
        ),
        link: null,
        show: this.visibleMenu(['admin_management'], 'brokers'),
        subItems: [
          {
            img: 'assets/icons/user.svg',
            text: this.translateService.instant(
              'IP.SIDENAV.OPTIONS.MANAGE_BROKER'
            ),
            link: 'broker',
            show: this.visibleSubMenu('manageBrokers')
          },
        ]
      },
      {
        img: 'assets/icons/sell.svg',
        text: this.translateService.instant('IP.SIDENAV.OPTIONS.SALES'),
        link: 'sales',
        show: this.visibleMenu(['admin_sale'],'sales')
      },
      {
        img: 'assets/icons/pay_in.svg',
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
        img: 'assets/icons/finances-icon.svg',
        text: this.translateService.instant('IP.SIDENAV.OPTIONS.PRODUCTION'),
        show: this.visibleMenu(['admin_commission'], 'commissions'),
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
        img: 'assets/icons/payments.svg',
        text: this.translateService.instant('IP.SIDENAV.OPTIONS.SETTLEMENT_SALES'),
        show: this.visibleMenu(['admin_settlement'], 'settlements'),
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
          {
            text: this.translateService.instant(
              'IP.SIDENAV.OPTIONS.SETTLEMENTS_OPTIONS.CONFIG'
            ),
            link: 'settlement-configurations',
            show: this.visibleSubMenu('invoicedSettlements')
          },
        ],
      },
      {
        img: 'assets/icons/pay_out.svg',
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
        img: 'assets/icons/book_collection.svg',
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
        img: 'assets/icons/management-icon.svg',
        text: this.translateService.instant('IP.SIDENAV.OPTIONS.CONSOLIDATED_OPTIONS.CONFIG'),
        link: null,
        show: this.visibleMenu(['admin_configuration'], 'configurations'),
        subItems: [
          {
            text: this.translateService.instant(
              'IP.SIDENAV.OPTIONS.CONSOLIDATED_TITLE'
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
        img: 'assets/icons/group_people.svg',
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
        img: 'assets/icons/manage-accounts.svg',
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
    ];
    return listItems;
  }
  

  async onLogout() {
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

  async setRolePermissions() {
    const userType = this.roleService.getUserType();
    if (this.type === 'business' && userType !== 'ENTERPRISE_MANAGER' && userType !== 'ENTERPRISE_ADMIN') {
      let role = this.authService.getUserRole()
      if (role === undefined) {
        role = await firstValueFrom(this.roleService.getUserPermission())
        this.authService.setUserRole(role)
      }
      if (role.permissions) {
        this.rolePermissions = role.permissions
        //this.router.navigateByUrl(`/invopay/${this.rolePermissions.sort((a,b)=>a.id!-b.id!)[0].component}`)
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
    this.resetMenuStatus();
  }

  private resetMenuStatus = () => {
    if (this.isExpanded) {
      this.isExpanded = false;
    }
    if (this.sidenavOpened) {
      if (this.isMobile) {
        this.sidenavOpened = false;
        this.sidenav.close();
      } else {
        this.sidenavOpened = true;
        this.sidenav.open();
      }
    }
  }

  toggleSidenav() {
    if (this.isMobile) {
      this.sidenavOpened = !this.sidenavOpened;
    } else {
      this.sidenavOpened = !this.sidenavOpened;
      this.isExpanded = !this.isExpanded;
    }
  }

  expandSidenav() {
    if (this.sidenavOpened) return;

    if (!this.isMobile && !this.isExpanded) {
      this.isExpanded = true;
    }
  }

  collapseSidenav() {
    if (this.sidenavOpened) return;
    if (!this.isMobile && this.isExpanded && !this.loadingActive) {
      this.isExpanded = false;
    }
  }

  @HostListener('transitionend', ['$event'])
  onTransitionEnd(event: TransitionEvent) {
    if (event.propertyName === 'width') {
      this.sidenavContainer.updateContentMargins();
    }
  }

  private closeSubMenuNotSelected = (itemSelected: any) => {
    this.listItems.forEach((item) => {
      if (item !== itemSelected) {
        item.showSubItems = false;
        item.isSelected = false;
      }
    });
  }

  visibleMenu(permission: PermissionType[], option: MainMenuOptions):boolean {
    let isVisible = true
    if (this.profileservice.enterpriseMeuConfig.length > 0){ 
      isVisible = this.profileservice.enterpriseMeuConfig.some(conf => this.subMenues[option].includes(conf))
    }
    if (isVisible && this.rolePermissions.length > 0){
      isVisible = permission.some(perm => this.rolePermissions.some(rolePerm => rolePerm.name === perm))      
    }
    if (isVisible && this.rolePermissions.length == 0 && this.typeManager == 'ENTERPRISE_USER'){
      isVisible = false
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
      if (isVisible && this.rolePermissions.length == 0 && this.typeManager == 'ENTERPRISE_USER') isVisible = false
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