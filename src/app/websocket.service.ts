// import { webSocket } from "rxjs/webSocket";
// const subject = webSocket("ws://localhost:7000");


import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
export const WS_ENDPOINT = environment.wsEndpoint;

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {
    private socket$!: WebSocketSubject<any>;
    private messagesSubject$ = new Subject();
    public messages$ = this.messagesSubject$.pipe(switchAll() as any, catchError(e => { throw e }));

    public connect(): void {
        if (!this.socket$ || this.socket$.closed) {
            this.socket$ = webSocket(WS_ENDPOINT);
            const messages = this.socket$.pipe(
                tap(data => console.log('ws message:', data)),
                tap({
                    error: error => console.log(error),
                }), catchError(_ => EMPTY));
            this.messagesSubject$.next(messages);
        }
    }


    sendMessage(msg: any) {
        this.socket$.next(msg);
    }

    close() {
        this.socket$.complete();
    }
}