import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheDescriptiveComponent } from './fiche-descriptive.component';

describe('FicheDescriptiveComponent', () => {
  let component: FicheDescriptiveComponent;
  let fixture: ComponentFixture<FicheDescriptiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FicheDescriptiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FicheDescriptiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
