/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LangService } from './lang.service';

describe('Service: LangService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LangService]
    });
  });

  it('should ...', inject([LangService], (service: LangService) => {
    expect(service).toBeTruthy();
  }));
});
