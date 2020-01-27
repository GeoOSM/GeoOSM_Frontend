import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThematiqueComponent } from './thematique.component';

describe('ThematiqueComponent', () => {
  let component: ThematiqueComponent;
  let fixture: ComponentFixture<ThematiqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThematiqueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThematiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
