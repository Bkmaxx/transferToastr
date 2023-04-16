import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoomInfoComponent } from './components/chat-room-info/chat-room-info.component';
import { ChatComponent } from './components/chat/chat.component';
import { SearchUserComponent } from './components/search-user/search-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import { CreateGroupChatComponent } from './components/create-group-chat/create-group-chat.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { HttpErrorPageComponent } from './components/http-error-page/http-error-page.component';
@NgModule({
  declarations: [
    ChatRoomInfoComponent,
    ChatComponent,
    SearchUserComponent,
    CreateGroupChatComponent,
    UserInfoComponent,
    HttpErrorPageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatIconModule,
  ]
})
export class SharedModule { }
