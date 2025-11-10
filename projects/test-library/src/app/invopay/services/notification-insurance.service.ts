import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Notification, NotificationRead } from '../interface/notificationResponse';
import { Broker } from '../interface/broker';
import { environment } from 'projects/test-library/src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class NotificationInsuranceService {

  constructor(private readonly http: HttpClient) { }
  api:string=environment.api+'/invopay/notifications'
  apiBrokers:string=environment.api+'/invopay/enterprises/brokers'
  getAllReadNotifications(type: string = '', userFromId?: number): Observable<Notification[]> {
    const params: any = { type };
    if (userFromId) {
      params.userFromId = userFromId;
    }
    return this.http.get<Notification[]>(`${this.api}/enterprise/read`, { params });
  }

  getAllUnreadNotifications(type: string = '', userFromId?: number): Observable<Notification[]> {
    const params: any = { type };
    if (userFromId) {
      params.userFromId = userFromId;
    }
    return this.http.get<Notification[]>(`${this.api}/enterprise/unread`, { params });
  }

  putNotificationRead(id: NotificationRead): Observable<void> {
    return this.http.put<void>(`${this.api}/enterprise/readNotification`, id);
  }
   getBrokers(): Observable<Broker[]> {
    return this.http.get<any[]>(`${this.apiBrokers}`).pipe(
      map(brokers =>
        brokers.map(b => ({
          id: b.id,
          username: b.username
        }))
      )
    );
  }
}
