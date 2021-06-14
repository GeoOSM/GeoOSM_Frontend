import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ThematiqueCityAbidjanComponent } from "./thematique-city-abidjan.component";

describe("ThematiqueCityAbidjanComponent", () => {
  let component: ThematiqueCityAbidjanComponent;
  let fixture: ComponentFixture<ThematiqueCityAbidjanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThematiqueCityAbidjanComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThematiqueCityAbidjanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
