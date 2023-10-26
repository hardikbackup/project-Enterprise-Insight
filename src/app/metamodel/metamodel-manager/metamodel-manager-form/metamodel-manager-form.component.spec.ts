import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetamodelManagerFormComponent } from './metamodel-manager-form.component';

describe('MetamodelManagerFormComponent', () => {
  let component: MetamodelManagerFormComponent;
  let fixture: ComponentFixture<MetamodelManagerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetamodelManagerFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetamodelManagerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
