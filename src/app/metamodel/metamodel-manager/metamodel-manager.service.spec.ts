import { TestBed } from '@angular/core/testing';

import { MetamodelManagerService } from './metamodel-manager.service';

describe('MetamodelManagerService', () => {
  let service: MetamodelManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetamodelManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
