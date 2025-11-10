import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Notification, NotificationRead } from '../interface/notificationResponse';
import { environment } from 'projects/test-library/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationBrokerService {

  constructor() { }
  private readonly http=inject(HttpClient);
  api:string=environment.api+'/invopay/notifications'

  getAllReadNotifications():Observable<Notification[]>{
    return this.http.get<Notification[]>(`${this.api}/provider/read`);
  }
  getAllUnreadNotifications():Observable<Notification[]>{
    return this.http.get<Notification[]>(`${this.api}/provider/unread`);
  }
  putNotificationRead(id:NotificationRead):Observable<void>{
    return this.http.put<void>(`${this.api}/provider/readNotification`,id);
  }
  
}
