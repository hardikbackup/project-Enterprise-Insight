import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelManagerTreeComponent } from './model-manager-tree.component';

describe('ModelManagerTreeComponent', () => {
  let component: ModelManagerTreeComponent;
  let fixture: ComponentFixture<ModelManagerTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelManagerTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelManagerTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
