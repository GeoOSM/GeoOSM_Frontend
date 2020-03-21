import { TestBed } from '@angular/core/testing';

import { PrrintService } from './prrint.service';

describe('PrrintService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrrintService = TestBed.get(PrrintService);
    expect(service).toBeTruthy();
  });
});
