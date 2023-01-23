import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rock-paper-scissors';

  constructor(protected sessionService: SessionService, protected router: Router) {}

  logout() {
    this.sessionService.logout();
    this.router.navigate(["/login"]);
  }

  get showLogout(): boolean {
    return !!this.sessionService.userSession;
  }
}
