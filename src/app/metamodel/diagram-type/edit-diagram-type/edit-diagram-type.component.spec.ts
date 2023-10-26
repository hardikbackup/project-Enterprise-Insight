import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDiagramTypeComponent } from './edit-diagram-type.component';

describe('EditDiagramTypeComponent', () => {
  let component: EditDiagramTypeComponent;
  let fixture: ComponentFixture<EditDiagramTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDiagramTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDiagramTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
