import { TestBed } from '@angular/core/testing';

import { AttributeTypeService } from './attribute-type.service';

describe('AttributeTypeService', () => {
  let service: AttributeTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttributeTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
