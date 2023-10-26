import { TestBed } from '@angular/core/testing';

import { RelationshipTypeService } from './relationship-type.service';

describe('RelationshipTypeService', () => {
  let service: RelationshipTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelationshipTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
