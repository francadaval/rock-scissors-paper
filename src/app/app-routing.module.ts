import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { RoomComponent } from './components/room/room.component';
import { AuthUserGuard } from './guards/auth-user.guard';
import { RoomsGuard } from './guards/rooms.guard';

const routes: Routes = [{
  path: 'login',
  component: LoginComponent
}, {
  path: '',
  component: MainComponent,
  canActivate: [AuthUserGuard]
}, {
  path: 'room/:id',
  component: RoomComponent,
  canActivate: [AuthUserGuard, RoomsGuard]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
