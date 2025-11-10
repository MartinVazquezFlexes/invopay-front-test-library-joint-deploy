import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import IpUserProfile from '../../invopay/interface/ip-user-profile';
import { IpProfileService } from '../../invopay/services/ip-profile.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  ngOnInit(): void {
    this.ipProfileService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        sessionStorage.setItem('userId', JSON.stringify(profile.id));
      }
    });
  }
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  private readonly router = inject(Router);
  private ipProfileService: IpProfileService = inject(IpProfileService);
  userProfile?: IpUserProfile;
  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }
  logout() {
this.router.navigate(['/login']);
  }
}
