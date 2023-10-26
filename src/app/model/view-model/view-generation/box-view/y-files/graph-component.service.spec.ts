import { TestBed } from '@angular/core/testing';

import { GraphComponentService } from './graph-component.service';

describe('GraphComponentServiceService', () => {
  let service: GraphComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
