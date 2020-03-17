import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RessourcesCityComponent } from './ressources-city.component';

describe('RessourcesCityComponent', () => {
  let component: RessourcesCityComponent;
  let fixture: ComponentFixture<RessourcesCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RessourcesCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RessourcesCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
