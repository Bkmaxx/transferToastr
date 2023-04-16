import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpErrorPageComponent } from './http-error-page.component';

describe('HttpErrorPageComponent', () => {
  let component: HttpErrorPageComponent;
  let fixture: ComponentFixture<HttpErrorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HttpErrorPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HttpErrorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
