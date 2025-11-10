import { Component, OnDestroy, OnInit, inject, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationBrokerService } from '../../services/notification-broker.service';
import { Notification, Observation, NotificationRead } from '../../interface/notificationResponse';
import { FormControl } from '@angular/forms';
import IpSelectInputOption from '../../../../../../base/src/lib/interfaces/ip-select-input-option';
import { Router } from '@angular/router';
import { combineLatest, forkJoin, Subscription } from 'rxjs';
import { NotificationItem, NotificationTrayConfig } from '../../interface/notification-tray.models';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ip-notification-modal-filter-mobile',
  templateUrl: './ip-notification-modal-filter-mobile.component.html',
  styleUrls: ['./ip-notification-modal-filter-mobile.component.scss']
})
export class IpNotificationModalFilterMobileComponent {
private subscription=new Subscription();
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  matdialog=inject(MatDialog)
  private readonly translate = inject(TranslateService);
  private readonly notificationBrokerService = inject(NotificationBrokerService);
  private readonly router=inject(Router)  
  notificationData: NotificationItem[] = [];
  originalNotificationData: NotificationItem[] = [];
  notificationUpdate:NotificationRead={
    notificationId:0
  }
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
        broker: 'IP.NOTIFICATIONS.TABLE.USER',
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
  private mobileBreakpoint = 1024; 
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkViewport();
  }

  private checkViewport() {
    const wasMobile = this.isMobileView;
    this.isMobileView = window.innerWidth < this.mobileBreakpoint;

    if (wasMobile && !this.isMobileView && this.showMobileFiltersModal) {
      this.showMobileFiltersModal = false;
    }
  }

  ngOnInit() {
    this.loadNotifications();
    this.entityOptions = this.notificationTrayConfig.entities.map(e => ({ label: e, value: e }));
    this.checkViewport();
  }

  private loadNotifications(): void {
    const sub = forkJoin({
      read: this.notificationBrokerService.getAllReadNotifications(),
      unread: this.notificationBrokerService.getAllUnreadNotifications()
    }).subscribe({
      next: ({ read, unread }) => {
        console.log(read,unread)
        const allNotifications = [...read, ...unread];
        this.originalNotificationData = this.mapToNotificationItem(allNotifications);
        this.notificationData = [...this.originalNotificationData];
        this.loadEntityTranslations();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.originalNotificationData = [];
        this.notificationData = [];
      }
    });
    this.subscription.add(sub);
  }

  private mapToNotificationItem(notifications: Notification[]): NotificationItem[] {
    return notifications.map(notification => ({
      id: notification.id,
      notificationDate: new Date(notification.observation.creationDate).toLocaleString('es-ES'),
      entity: notification.type,
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
    }));
  }

  /*
   Output handlers
   */
  onViewNotification(notification: NotificationItem): void {
    this.selectedNotification = notification;
    this.replyText = '';
    if (this.selectedNotification.answered === 'No') {
      this.notificationUpdate.notificationId=this.selectedNotification.id
      const sub=this.notificationBrokerService.putNotificationRead(this.notificationUpdate)
        .subscribe({
          next:()=>{
            this.loadNotifications();
          },
          error:(error)=>{
            console.error('Error updating notification:', error);
          }
      })
      this.subscription.add(sub);
    }
    this.isReplyMode = false;
    this.showNotificationModal = true;
  }

  onReplyNotification(notification: NotificationItem): void {
    const type = notification._rawData.entity;
    const domainId = notification._rawData.observation.domainId;

    if (type === 'SETTLEMENT') {
      this.router.navigate(['invopay/broker/settlement-comments', { id: domainId }]);
    } else if (type === 'INVOICE') {
      this.router.navigate(['invopay/broker/invoice-comments', { id: domainId }]);
    }
  }

  onSearchPerformed(filters: any): void {
    this.selectedAnswered = filters.answered || '';
    this.selectedEntity = filters.entity || '';
    this.selectedUser = filters.user || '';

    let filteredData = [...this.originalNotificationData];

    if (filters.answered) {
      const answeredValue = filters.answered === 'si';
      filteredData = filteredData.filter(item =>
        item._rawData.answered === answeredValue
      );
    }

    if (filters.entity) {
      filteredData = filteredData.filter(item =>
        item.entity === filters.entity
      );
    }

    if (filters.user) {
      filteredData = filteredData.filter(item =>
        item.brokerName.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    this.notificationData = filteredData;
  }

  onFiltersCleared(): void {
    this.selectedAnswered = '';
    this.selectedEntity = '';
    this.selectedUser = '';
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
    const dialogRef=this.matdialog.open(IpNotificationModalFilterMobileComponent)
  }

  onMobileSearch(): void {
    let filteredData = [...this.originalNotificationData];

    if (this.selectedAnswered) {
      const answeredValue = this.selectedAnswered === 'si';
      filteredData = filteredData.filter(item =>
        item._rawData.answered === answeredValue
      );
    }

    if (this.selectedEntity) {
      filteredData = filteredData.filter(item =>
        item.entity === this.selectedEntity
      );
    }

    if (this.selectedUser) {
      filteredData = filteredData.filter(item =>
        item.brokerName.toLowerCase().includes(this.selectedUser.toLowerCase())
      );
    }

    this.notificationData = filteredData;
    this.hasMobileSearched = true;
    this.showMobileFiltersModal = false;
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
    if (this.selectedNotification) {
      const request: NotificationRead = { notificationId: this.selectedNotification.id, reply: replyText };
      const sub = this.notificationBrokerService.putNotificationRead(request).subscribe({
        next: () => {
          alert('Respuesta enviada correctamente');
          this.closeNotificationModal();
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error sending reply:', error);
          alert('Error al enviar la respuesta');
        }
      });
      this.subscription.add(sub);
    }
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
      text: this.replyText.trim(),
      respondedBy: 'Corredor'
    };

    if (!this.selectedNotification.responses) {
      this.selectedNotification.responses = [];
    }
    this.selectedNotification.responses.push(newResponse);

    this.selectedNotification.answered = 'Sí';
    this.selectedNotification._rawData.answered = true;
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
        entity: this.entityTranslations[item.entity.toLowerCase()] || item.entity
      }));
      this.originalNotificationData = [...this.notificationData];
    });
    this.subscription.add(sub);
  }
}
