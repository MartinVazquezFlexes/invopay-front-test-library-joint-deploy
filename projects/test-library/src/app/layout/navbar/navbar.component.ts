import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import IpUserProfile from '../../invopay/interface/ip-user-profile';
import { IpProfileService } from '../../invopay/services/ip-profile.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  
  private readonly router = inject(Router);
  private ipProfileService: IpProfileService = inject(IpProfileService);
  private translate: TranslateService = inject(TranslateService);
  
  userProfile?: IpUserProfile;
  currentLang: string = 'es';
  
  /*Descomentar si a rodri le gusta cuando se lo mostremos
  
  //control
  languageControl = new FormControl('es');
  
  //opciones de idioma
  languageOptions = [
    { value: 'es', label: 'ES' },
    { value: 'pt', label: 'PT' }
  ];*/

  ngOnInit(): void {
    // Cargar idioma guardado
    /*const savedLang = localStorage.getItem('language') || 'es';
    this.currentLang = savedLang;
    this.languageControl.setValue(savedLang);
    this.translate.use(savedLang);*/

    this.ipProfileService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        sessionStorage.setItem('userId', JSON.stringify(profile.id));
      }
    });
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  onLanguageChange(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}