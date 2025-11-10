import { Component, OnDestroy, OnInit, inject, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NotificationInsuranceService } from '../../services/notification-insurance.service';
import { Notification, Observation, NotificationRead } from '../../interface/notificationResponse';
import { FormControl } from '@angular/forms';
import IpSelectInputOption from '../../../../../../base/src/lib/interfaces/ip-select-input-option';
import { forkJoin, Subscription, combineLatest } from 'rxjs';
import { Broker } from '../../interface/broker';
import { NotificationItem, NotificationTrayConfig } from '../../interface/notification-tray.models';

@Component({
  selector: 'app-insurance-notification-tray',
  templateUrl: './insurance-notification-tray.component.html',
  styleUrls: ['./insurance-notification-tray.component.scss']
})
export class InsuranceNotificationTrayComponent implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationInsuranceService);
  private subscription = new Subscription();

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  brokers:Broker[]=[];
  brokerOptions: IpSelectInputOption[] = [];
  selectedBrokerId: number | null = null;
  
  notificationData: NotificationItem[] = [];
  originalNotificationData: NotificationItem[] = [];
  notificationUpdate: NotificationRead = {
    notificationId: 0
  };
  entityTranslations: { [key: string]: string } = {};

  /*
   Modal state
   */
  showNotificationModal = false;
  selectedNotification: NotificationItem | null = null;
  replyText = '';
  isReplyMode = false;
  showMobileFiltersModal = false;

  /*
  Mobile filters state
  */
  selectedAnswered = '';
  selectedEntity = '';
  selectedUser = '';
  hasMobileSearched = false;

  onViewNotification(notification: NotificationItem): void {
    this.selectedNotification = notification;
    this.replyText = '';
    if (this.selectedNotification.answered === 'No') {
      this.notificationUpdate.notificationId = this.selectedNotification.id;
      const sub = this.notificationService.putNotificationRead(this.notificationUpdate)
        .subscribe({
          next: () => {
            this.loadNotifications();
          },
          error: (error) => {
            console.error('Error updating notification:', error);
          }
        });
      this.subscription.add(sub);
    }
    this.isReplyMode = false;
    this.showNotificationModal = true;
  }

  /* 
  Mobile filters state
  */
  answeredControl = new FormControl();
  entityControl = new FormControl();
  userControl = new FormControl();

  answeredOptions: IpSelectInputOption[] = [
    { label: '', labelCode: 'IP.NOTIFICATIONS.FILTERS.YES', value: 'si' },
    { label: '', labelCode: 'IP.NOTIFICATIONS.FILTERS.NO', value: 'no' }
  ];
  entityOptions: IpSelectInputOption[] = [];
  userOptions: IpSelectInputOption[] = [];

  notificationTrayConfig: NotificationTrayConfig = {
    title: 'IP.NOTIFICATIONS.TITLE',
    columns: [
      'notificationDate',
      'entity',
      'brokerName',
      'query',
      'answered'
    ],
    actions: ['search','comment'],
    tableStyle: 'invopay',
    entities: [
      'Liquidación',
      'Comisión',
      'Factura',
      'Pago'
    ],
    users: [
      'Juan Pérez',
      'María Rodríguez',
      'Carlos López'
    ],
    translations: {
      table: {
        date: 'IP.NOTIFICATIONS.TABLE.DATE',
        entity: 'IP.NOTIFICATIONS.TABLE.ENTITY',
        broker: 'IP.NOTIFICATIONS.TABLE.BROKER',
        query: 'IP.NOTIFICATIONS.TABLE.QUERY',
        answered: 'IP.NOTIFICATIONS.TABLE.ANSWERED'
      },
      filters: {
        answered: 'IP.NOTIFICATIONS.FILTERS.ANSWERED',
        entity: 'IP.NOTIFICATIONS.FILTERS.ENTITY',
        user: 'IP.NOTIFICATIONS.FILTERS.USER',
        answeredPlaceholder: 'IP.NOTIFICATIONS.FILTERS.ANSWERED_PLACEHOLDER',
        entityPlaceholder: 'IP.NOTIFICATIONS.FILTERS.ENTITY_PLACEHOLDER',
        userPlaceholder: 'IP.NOTIFICATIONS.FILTERS.USER_PLACEHOLDER',
        yes: 'IP.NOTIFICATIONS.FILTERS.YES',
        no: 'IP.NOTIFICATIONS.FILTERS.NO'
      }
    }
  };

  private isMobileView = false;
  private mobileBreakpoint = 1024; // Match this with your mobile breakpoint

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkViewport();
  }

  private checkViewport() {
    const wasMobile = this.isMobileView;
    this.isMobileView = window.innerWidth < this.mobileBreakpoint;
    
    // Close modal when switching from mobile to desktop
    if (wasMobile && !this.isMobileView && this.showMobileFiltersModal) {
      this.showMobileFiltersModal = false;
    }
  }

  ngOnInit() {
    this.loadBrokers();
    this.loadNotifications();
    this.entityOptions = this.notificationTrayConfig.entities.map(e => ({ label: e, value: e }));
    this.userOptions = this.notificationTrayConfig.users.map(u => ({ label: u, value: u }));
    this.checkViewport();
  }

  private loadNotifications(type: string = '', filters: any = {}): void {
    const hasFilters = Object.keys(filters).length > 0 || this.selectedBrokerId || this.selectedEntity;
    
    if (!hasFilters) {
      console.log('No filters provided, skipping API call');
      this.notificationData = [];
      this.originalNotificationData = [];
      return;
    }
    if (!type && this.selectedEntity) {
      type = this.getEntityType(this.selectedEntity);
    }
    
    const userId = this.selectedBrokerId || undefined; 
    console.log('Loading notifications with params - type:', type, 'userId:', userId);
    
    this.subscription.add(
      forkJoin({
        read: this.notificationService.getAllReadNotifications(type, userId),
        unread: this.notificationService.getAllUnreadNotifications(type, userId)
      }).subscribe({
        next: (result) => {
          console.log('API Response:', result);
          const readNotifications = result.read || [];
          const unreadNotifications = result.unread || [];
          const allNotifications = [...readNotifications, ...unreadNotifications];
          
          console.log('Total notifications loaded:', allNotifications.length);
          
          this.notificationData = allNotifications.map(notification => this.mapToNotificationItem(notification));
          this.originalNotificationData = [...this.notificationData];
          this.loadEntityTranslations();

          // Apply filters if any were provided
          if (Object.keys(filters).length > 0) {
            console.log('Applying initial filters:', filters);
            this.applyFilters(filters);
          }
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      })
    );
  }
  loadBrokers(){
    const sub = this.notificationService.getBrokers().subscribe({
      next: (result) => {
        this.brokers = result;
        this.brokerOptions = this.brokers.map(broker => ({
          label: broker.username,
          value: broker.id.toString()
        }));
      },
      error: (error) => {
        console.error('Error loading brokers:', error);
      }
    });
    this.subscription.add(sub);
  }

  onBrokerSelected(event: any): void {
    this.selectedBrokerId = event ? Number(event) : null;
  }
  private mapToNotificationItem(notification: Notification): NotificationItem {
    return {
      id: notification.id,
      notificationDate: new Date(notification.observation.creationDate).toLocaleString('es-ES'),
      entity: this.entityTranslations[notification.type.toLowerCase()] || notification.type,
      brokerName: notification.observation.username,
      query: notification.observation.description,
      answered: notification.isRead ? 'Sí' : 'No',
      _rawData: {
        id: notification.id,
        notificationDate: new Date(notification.observation.creationDate).toLocaleString('es-ES'),
        entity: notification.type,
        brokerName: notification.observation.username,
        query: notification.observation.description,
        answered: notification.isRead,
        observation: notification.observation
      },
      responses: []
    };
  }

  private loadEntityTranslations(): void {
    const keys = ['IP.NOTIFICATIONS.ENTITIES.SETTLEMENT', 'IP.NOTIFICATIONS.ENTITIES.COMMISSION', 'IP.NOTIFICATIONS.ENTITIES.INVOICE', 'IP.NOTIFICATIONS.ENTITIES.PAYMENT'];
    const observables = keys.map(key => this.translate.get(key));
    const sub = combineLatest(observables).subscribe(translations => {
      this.entityTranslations = {
        settlement: translations[0],
        commission: translations[1],
        invoice: translations[2],
        payment: translations[3]
      };
      this.notificationData = this.notificationData.map(item => ({
        ...item,
        entity: this.entityTranslations[item._rawData.entity.toLowerCase()] || item.entity
      }));
      this.originalNotificationData = [...this.notificationData];
    });
    this.subscription.add(sub);
  }

  private getEntityType(translated: string): string {
    const map: { [key: string]: string } = {
      'Liquidación': 'SETTLEMENT',
      'Comisión': 'COMMISSION',
      'Factura': 'INVOICE',
      'Pago': 'PAYMENT'
    };
    return map[translated] || '';
  }

  private applyFilters(filters: any): void {
    console.log('Applying filters:', filters);
    let filteredData = [...this.originalNotificationData];

    if (filters.answered) {
      const answeredValue = filters.answered === 'si';
      filteredData = filteredData.filter(item => 
        item._rawData.answered === answeredValue
      );
      console.log('After answered filter:', filteredData.length, 'items');
    }

    if (filters.entity) {
      const entityType = this.getEntityType(filters.entity);
      filteredData = filteredData.filter(item =>
        item._rawData.entity === entityType
      );
      console.log('After entity filter:', filteredData.length, 'items');
    }

    if (filters.user) {
      if (!isNaN(filters.user)) {
        const brokerId = Number(filters.user);
        filteredData = filteredData.filter(item => 
          item._rawData.observation?.userProvider === brokerId ||
          item._rawData.observation?.userInvopayId === brokerId
        );
      } else {
        filteredData = filteredData.filter(item =>
          item.brokerName?.toLowerCase().includes(filters.user.toLowerCase())
        );
      }
      console.log('After user filter:', filteredData.length, 'items');
    }

    console.log('Final filtered data:', filteredData);
    this.notificationData = filteredData;
  }

  /*
   Output handlers
   */

  onReplyNotification(notification: NotificationItem): void {
    const type = notification._rawData.entity;
    const domainId = notification._rawData.observation.domainId;

    if (type === 'SETTLEMENT') {
      this.router.navigate(['invopay/admin/settlement-comments', { id: domainId }]);
    } else if (type === 'INVOICE') {
      this.router.navigate(['invopay/admin/invoice-comments', { id: domainId }]);
    }
  }

  onSearchPerformed(filters: any): void {
    console.log('Search filters received:', filters);
    
    this.selectedAnswered = filters.answered || '';
    this.selectedEntity = filters.entity || '';
    this.selectedUser = filters.user || '';
  
    if (filters.user) {
      if (!isNaN(filters.user)) {
        this.selectedBrokerId = Number(filters.user);
      } else {
        const broker = this.brokers.find(b => 
          b.username.toLowerCase() === filters.user.toLowerCase()
        );
        if (broker) {
          this.selectedBrokerId = broker.id;
        }
      }
    } else {
      this.selectedBrokerId = null;
    }
    
    console.log('Selected broker ID:', this.selectedBrokerId);
    
    const entityType = this.getEntityType(filters.entity || '');
    console.log('Entity type for API call:', entityType);
    
    this.loadNotifications(entityType, {
      ...filters,
      user: this.selectedBrokerId?.toString() || filters.user
    });
  }

  onFiltersCleared(): void {
    this.selectedAnswered = '';
    this.selectedEntity = '';
    this.selectedUser = '';
    this.selectedBrokerId = null;
    this.hasMobileSearched = false;
    this.notificationData = [...this.originalNotificationData];
    this.answeredControl.reset();
    this.entityControl.reset();
    this.userControl.reset();
  }

  get isMobileSearchDisabled(): boolean {
    return !this.selectedAnswered && !this.selectedEntity && !this.selectedUser;
  }

  get isMobileClearEnabled(): boolean {
    return this.hasMobileSearched;
  }

  onUserChanged(event: Event) {
    this.selectedUser = (event.target as HTMLInputElement).value;
  }

  onMobileFiltersOpened(): void {
    this.showMobileFiltersModal = true;
  }

  onMobileSearch(): void {
    const filters = {
      answered: this.answeredControl.value,
      entity: this.entityControl.value,
      user: this.selectedBrokerId?.toString() || ''
    };
    this.loadNotifications('', filters);
  }

  onMobileClearFilters(): void {
    this.selectedAnswered = '';
    this.selectedEntity = '';
    this.selectedUser = '';
    this.hasMobileSearched = false;
    this.notificationData = [...this.originalNotificationData];
    this.showMobileFiltersModal = false;
  }

  /*
   Modal methods
  */
  onSendReply(replyText: string): void {
    console.log('Sending reply:', replyText);
    alert('Respuesta enviada correctamente');
    this.closeNotificationModal();
  }

  closeNotificationModal(): void {
    this.showNotificationModal = false;
    this.selectedNotification = null;
    this.replyText = '';
  }

  submitReply(): void {
    if (!this.replyText?.trim() || !this.selectedNotification) return;

    const newResponse = {
      date: new Date().toLocaleString('es-ES'),
      text: this.replyText.trim()
    };

    if (!this.selectedNotification.responses) {
      this.selectedNotification.responses = [];
    }
    this.selectedNotification.responses.push(newResponse);

    this.selectedNotification.answered = 'Sí';
    this.selectedNotification._rawData.answered = true;
  }
}
