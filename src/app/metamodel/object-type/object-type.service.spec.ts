import { TestBed } from '@angular/core/testing';

import { ObjectTypeService } from './object-type.service';

describe('ObjectTypeService', () => {
  let service: ObjectTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
