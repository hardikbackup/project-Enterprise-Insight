import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetamodelManagerComponent } from './metamodel-manager.component';

describe('MetamodelManagerComponent', () => {
  let component: MetamodelManagerComponent;
  let fixture: ComponentFixture<MetamodelManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetamodelManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetamodelManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
