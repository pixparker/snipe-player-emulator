import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';

import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { catchError, tap, switchAll, take } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';


//export const WS_ENDPOINT = environment.wsEndpoint;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  public form: FormGroup = {} as any;
  private socket!: any;
  otp: string = '';

  initialized: boolean = false;
  connected = false;
  stats = {
    initialized: '',
    connected: '',
  }


  //public messages$ = this.messagesSubject$.pipe(switchAll() as any, catchError(e => { throw e }));


  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      playerId: new FormControl(this.loadPlayerId()),
      serverUrl: new FormControl(this.loadServerUrl()),
      macAddress: new FormControl(this.loadMacAddress()),
    });

  }

  public connectWebsocket(): void {

    let serverUrl = this.loadServerUrl() || '';
    this.socket = io(serverUrl);
    this.socket.on('connect', () => {
      console.log('socket connected:' + this.socket.connected, this.socket.id);
      //this.playerConnect();
    })

    const events = [
      'player::registered',
      'player::restart',
      'program::updated',
      'player::update',
    ];

    for (let event of events) {
      this.socket.on(event, (data: any) => {
        console.log('event -> ', event, data)
      });
    }


    this.socket.io.on("reconnect", (data: any) => {
      console.log('reconnect', data)
    });

    this.socket.on('error', (error: { message: any; }) => {
      console.log('Socket cluster error:', error.message);
    });

    this.socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${this.socket.id}`);
    });

    this.socket.on('kickout', () => {
      console.log(`Socket kicked out: ${this.socket.id}`);
    });

    this.initialized = true;
    this.stats.initialized = '(initialized)'
  }


  public disconnectWebsocket(): void {
    this.socket.disconnect();
  }


  playerConnect() {
    //if (!this.socket) this.initWebsocket();
    const playerId = this.form.value.playerId;
    console.log('playerId:', playerId);

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

    this.socket.emit('player:connect', message);
    this.stats.connected = '(connected)'
  }





  requestOtp() {
    const macAddress = this.form.value.macAddress;
    const serverUrl = this.form.value.serverUrl;
    if (!macAddress) {
      alert('mac address not found');
      return;
    }

    if (!serverUrl) {
      alert('server url not defined');
      return;
    }



    this.http.post(`${serverUrl}/players/otp/request`, {
      "name": macAddress,
      "macAddress": macAddress,
      "ipAddress": "204.521.32.12",
      "description": "emulator screen"
    }).pipe(take(1)).subscribe(data => {
      this.otp = (data as any).result;
    })
  }



  loadPlayerId(): string | null {
    return localStorage.getItem('playerId');
  }

  savePlayerId() {
    localStorage.setItem('playerId', this.form.value.playerId);
  }


  loadServerUrl(): string | null {
    return localStorage.getItem('serverUrl') || 'http://localhost:7000/';
  }

  saveServerUrl() {
    localStorage.setItem('serverUrl', this.form.value.serverUrl);
  }


  loadMacAddress(): string | null {
    return localStorage.getItem('macAddress') || 'emulator:a';
  }

  saveMacAddress() {
    localStorage.setItem('macAddress', this.form.value.macAddress);
  }



}
