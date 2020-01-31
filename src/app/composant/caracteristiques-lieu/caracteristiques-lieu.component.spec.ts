import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracteristiquesLieuComponent } from './caracteristiques-lieu.component';

describe('CaracteristiquesLieuComponent', () => {
  let component: CaracteristiquesLieuComponent;
  let fixture: ComponentFixture<CaracteristiquesLieuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaracteristiquesLieuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaracteristiquesLieuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
