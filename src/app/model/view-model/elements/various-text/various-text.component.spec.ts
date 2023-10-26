import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariousTextComponent } from './various-text.component';

describe('VariousTextComponent', () => {
  let component: VariousTextComponent;
  let fixture: ComponentFixture<VariousTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariousTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariousTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
