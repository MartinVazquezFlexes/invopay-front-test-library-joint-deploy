import { ProductService } from './../../services/product.service';
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import IpUserProfile from '../../interface/ip-user-profile';
import { IpProfileService } from '../../services/ip-profile.service';
import { SchemeService } from '../../services/scheme.service';
import { IpInstanceDetailService } from '../../services/ip-instance-detail.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private ipProfileService: IpProfileService = inject(IpProfileService);
  userProfile: Observable<IpUserProfile> = new Observable<IpUserProfile>();
  constructor(private schemeService: SchemeService, private productService: ProductService, private ipInstanceDetailService: IpInstanceDetailService) { }

  probarEndpoint() {
    console.log('🟡 Iniciando petición...');

    this.schemeService.getAllInstances().subscribe({
      next: (response) => {
        console.log('✅ RESPUESTA DE LA API (Raw JSON):');
        console.dir(response);
      },
      error: (err) => {
        console.error('❌ ERROR EN LA PETICIÓN:', err);
        console.log('Status:', err.status);
        console.log('Mensaje:', err.message);
      },
      complete: () => {
        console.log('🏁 Petición finalizada.');
      }
    });
  }
  ngOnInit(): void {
    this.userProfile = this.ipProfileService.getUserProfile();
  }

}
