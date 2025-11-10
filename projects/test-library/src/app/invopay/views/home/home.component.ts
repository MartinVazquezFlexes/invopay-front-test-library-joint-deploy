import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import IpUserProfile from '../../interface/ip-user-profile';
import { IpProfileService } from '../../services/ip-profile.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private ipProfileService: IpProfileService = inject(IpProfileService);
  userProfile: Observable<IpUserProfile> = new Observable<IpUserProfile>();

  ngOnInit(): void {
    this.userProfile = this.ipProfileService.getUserProfile();
  }

}
