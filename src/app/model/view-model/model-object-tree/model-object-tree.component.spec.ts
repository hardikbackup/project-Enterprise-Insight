import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelObjectTreeComponent } from './model-object-tree.component';

describe('ModelObjectTreeComponent', () => {
  let component: ModelObjectTreeComponent;
  let fixture: ComponentFixture<ModelObjectTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelObjectTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelObjectTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
