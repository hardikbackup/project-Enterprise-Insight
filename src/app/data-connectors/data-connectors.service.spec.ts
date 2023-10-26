import { TestBed } from '@angular/core/testing';

import { DataConnectorsService } from './data-connectors.service';

describe('DataConnectorsService', () => {
  let service: DataConnectorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataConnectorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
