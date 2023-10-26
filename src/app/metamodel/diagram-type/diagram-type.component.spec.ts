import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramTypeComponent } from './diagram-type.component';

describe('DiagramTypeComponent', () => {
  let component: DiagramTypeComponent;
  let fixture: ComponentFixture<DiagramTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagramTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
