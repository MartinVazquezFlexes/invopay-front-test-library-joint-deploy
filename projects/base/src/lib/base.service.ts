import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  constructor(translateService: TranslateService) {
    translateService.setDefaultLang('es');
  }
}
