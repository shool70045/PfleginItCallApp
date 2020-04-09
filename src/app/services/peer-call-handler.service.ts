import { Injectable } from "@angular/core";

declare var Peer: any;
@Injectable({
  providedIn: "root"
})
export class PeerCallHandlerService {
  callDataStructure: object = {};

  constructor() {}
}
