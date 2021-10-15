import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';

import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
export const WS_ENDPOINT = environment.wsEndpoint;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  public form: FormGroup = {} as any;
  private socket$!: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  public messages$ = this.messagesSubject$.pipe(switchAll() as any, catchError(e => { throw e }));

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({ playerId: new FormControl(this.loadPlayerId()) })

  }

  public connect(): void {
    console.log('connect to websocket', WS_ENDPOINT, this.socket$);
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


  playerConnect() {

    if (!this.socket$) this.connect();
    const playerId = this.form.value.playerId;
    console.log('playerId:', playerId);
    this.savePlayerId(playerId);

    const message = {
      "appVersion": "0.1.3 SnipeAds",
      "campaign": "",
      "campaignDate": "",
      "channel": "",
      "clientID": "",
      "data": {},
      "deviceInfo": "Android SDK: 25 (7.1.1)",
      "downloadTime": "",
      "externalMemory": "348MB / 774MB",
      "internalMemory": "348MB / 774MB",
      "ipAddress": "192.168.232.2",
      "isGPSAvailable": false,
      "isTouchscreen": true,
      "launchTime": "",
      "license": "",
      "macAddress": "02:00:00:44:55:66",
      "name": " 1",
      "paddingX": 0,
      "paddingY": 0,
      "player": playerId,
      "screenOrientation": "PORTRIAT",
      "screenResolution": "2560X1504",
      "settings": "{\"appVersion\":\"\",\"app_version\":\"0.1.3 SnipeAds\",\"campaign\":\"\",\"campaignDate\":\"\",\"client\":\"\",\"clientID\":\"\",\"deviceInfo\":\"\",\"device_info\":\"Android SDK: 25 (7.1.1)\",\"downloadTime\":\"\",\"externalMemory\":\"\",\"fcmToken\":\"\",\"id\":\"bdb05e6b-6b3e-4be3-a498-06a97f8f2f4f\",\"internalMemory\":\"\",\"ipAddress\":\"192.168.232.2\",\"isGPSAvailable\":false,\"isTouchscreen\":false,\"is_touchscreen\":true,\"launchTime\":\"\",\"launch_time\":\"\",\"license\":\"\",\"macAddress\":\"02:00:00:44:55:66\",\"manufacturer\":\"Google\",\"model\":\"Android SDK built for x86\",\"name\":\" 1\",\"otp\":\"770062\",\"paddingX\":0,\"paddingY\":0,\"player\":\"\",\"screenOrientation\":\"\",\"screenResolution\":\"\",\"settings\":\"\",\"startupTime\":\"\",\"status\":\"REGISTERED\",\"timezone\":\"\",\"token\":\"\"}",
      "startupTime": "",
      "timezone": "GMT+00:00"
    };

    this.sendMessage(message);
  }




















  loadPlayerId(): string {
    return localStorage.getItem('playerId') || 'ae739d7d-4d42-44ac-96c4-98cb962801c3';
  }

  savePlayerId(id: string) {
    localStorage.setItem('playerId', id);
  }



}
