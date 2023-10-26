import { TestBed } from '@angular/core/testing';

import { NodeStyleDecoratorService } from './node-style-decorator.service';

describe('NodeStyleDecoratorService', () => {
  let service: NodeStyleDecoratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeStyleDecoratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
