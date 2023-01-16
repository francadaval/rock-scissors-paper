import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../../../services/websocket.service'

@Component({
	selector: 'app-connection-console',
	templateUrl: './connection-console.component.html'
})
export class ConnectionConsoleComponent implements OnInit {

	constructor( protected wsService: WebSocketService ) {}

	output: string = " > "

	ngOnInit(): void {
		this.wsService.connect().subscribe( msg => {
			this.output += "<span class='received'>" + msg.data + "</span>"
			this.output += "<br><span> > </span>"
		})

		this.wsService.sent.subscribe( msg => {
			this.output += "<span class='sent'>" + msg + "</span>"
			this.output += "<br><span> > </span>"
		})
	}
}
