import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'projects/test-library/src/environments/environment';
import { SalesResponse } from '../interface/salesResponse';
import { saleDetail } from '../interface/saleDetail';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
 private apiUrl = environment.api+'/invopay';
 

  constructor(private http: HttpClient) {}

  private temporalToken = 'eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0.jMrcGHhW6_yEMj1zIL974MCrYvYx2vSvs0_ImlrAaTDBzWLYLkKeOsoysa54Zk7qfwxR2vCAJPFTTikdXQWf-Kvx-AD5JhkgjjtMJefPrvTjRthKtzAwzY6bOfyVUA5BlBa6vSFd6rJatLknGVi0wg3rHOqieYXEptKIS1UEwnzK2l2IS_jldAlM54XcMI7D_VYMsqLq5jumSlBvcWOQzi5vhbA6aJy0msezUSGE_w72xLVUm-9J8ElLMoCDdmqQpSp2cCbbJUGEa-Cqh2FzLo7lzlns-wtIxG6zUSghwGg999GROygz1XTLmNTqNiecE0TnWjKyciS9lz9KUM6QCw.M-md5jiOK83aiUFj.l3PCqNAt3rJv4q7CzhGgiATqTXX3HoDw8XKFr3S09MHnnX2C5aEOo5mADBPaUnlk_YVO7ZDQ1CRVzqjXw6qHlJwSAEnZHAEA6DVHFSmlBKyq0aHRS-OZdgKZa-2irERx8KEAqAsn6YYKFOybLedpneCekpsog7idfbQ0KS2WuMOB4FV0vMK2HUV7khA_Z6oURaZMw6GoUX8BsCUU9rIs1QC43RkTt2nv05fQZ2c9SVfvR1FSqwzxkHuUcvKbk1kjR56yzx3iLcheCjjG5rPvXTITNXWR413-7CI.Xh4IrFo3HfQtlzv0U4PwQA'

  getSales(): Observable<SalesResponse> {
    return this.http.get<SalesResponse>(`${this.apiUrl}/sale`, {
    });
  }
  getSale(id: string): Observable<saleDetail> {


    return this.http.get<saleDetail>(`${this.apiUrl}/sale/${id}`);
  }
}