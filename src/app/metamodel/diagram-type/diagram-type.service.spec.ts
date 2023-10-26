import { TestBed } from '@angular/core/testing';

import { DiagramTypeService } from './diagram-type.service';

describe('DiagramTypeService', () => {
  let service: DiagramTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagramTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
