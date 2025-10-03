import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyComponent } from './party';

describe('PartyComponent', () => {
  let component: PartyComponent;
  let fixture: ComponentFixture<PartyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyComponent] // standalone components go in imports
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
