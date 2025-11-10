import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(private http: HttpClient) {}

  private _configObj = new BehaviorSubject<any>({});
  currentConfigObj$ = this._configObj.asObservable();

  setConfigObj(configObj: any) {
    this._configObj.next(configObj);
  }

  loadFont(fontUrl: string, fontVariableName: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
    document.documentElement.style.setProperty(
      fontVariableName,
      `var(--${fontVariableName})`
    );
  }
  getTheme() {
    return this.http.get('assets/mock/theme-default.json').pipe(
      map((theme: any) => {
        this.setConfigObj(theme);
        theme.backgroundImage = `url('${theme.backgroundImage}')`;
        return theme;
      })
    );
  }
}
