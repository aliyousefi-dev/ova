import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiLibrary } from './ui-library';

describe('UiLibrary', () => {
  let component: UiLibrary;
  let fixture: ComponentFixture<UiLibrary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiLibrary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiLibrary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
