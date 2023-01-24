import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SessionService } from '../../services/session.service'

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

	constructor( 
		protected builder: FormBuilder,
		protected router: Router,
		protected sessionService: SessionService ) {

		this.loginFormGroup = this.builder.group({
			username: ['',Validators.required],
			password: ['',Validators.required]
		})
	}

	public loginFormGroup: FormGroup;
	public loginError: boolean = false
	public get disabledLogin(): boolean {
		return this.loginFormGroup.invalid
	}

	ngOnInit(): void {
		this.sessionService.$userSession.then( (userSession) => {
			if( userSession ) {
				console.log( "User on login screen, redirecting..." )
				this.router.navigate(['/']);
			} else console.log( "No user on login screen." );
		}).catch( () => {
			console.log( "No user on login screen." )
		})
	}

	login() {
		if( this.loginFormGroup.valid ) {
			this.sessionService.login( this.loginFormGroup.value.username,
				this.loginFormGroup.value.password ).then( (user) => {
				if( user ) {
					console.log( "Logged User!!" );
					this.router.navigate(['/']);
				} else this.loginError = true;
			}).catch( () => {
				this.loginError = true;
			})
		}
	}
}
