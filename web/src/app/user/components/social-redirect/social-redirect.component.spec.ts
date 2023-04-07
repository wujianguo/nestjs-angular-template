import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialRedirectComponent } from './social-redirect.component';

describe('SocialRedirectComponent', () => {
  let component: SocialRedirectComponent;
  let fixture: ComponentFixture<SocialRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialRedirectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
