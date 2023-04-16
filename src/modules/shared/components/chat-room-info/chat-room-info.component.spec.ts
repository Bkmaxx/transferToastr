import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomInfoComponent } from './chat-room-info.component';

describe('ChatRoomInfoComponent', () => {
  let component: ChatRoomInfoComponent;
  let fixture: ComponentFixture<ChatRoomInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatRoomInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatRoomInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
