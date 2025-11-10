import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Lang } from '../../models/Lang';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-langSelector',
  templateUrl: './langSelector.component.html',
  styleUrls: ['./langSelector.component.scss'],
})
export class LangSelectorComponent implements OnInit {
  langs: Lang[] = [];

  constructor(
    public translate: TranslateService,
    public langService: LangService
  ) {}

  ngOnInit() {
    this.langs = this.langService.getAllLanguages();
  }

  selectLang(lang: string) {
    this.langService.setCurrentLanguage(lang);
  }

  getcurrentLang() {
    return this.langService.getCurrentLanguage().code.toUpperCase();
  }
}
