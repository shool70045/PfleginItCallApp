import { Component, AbstractType } from "@angular/core";
declare var Peer: any;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.sass"]
})
export class AppComponent {
  title: string = "PfleginItCallApp";
  sideBarMode = "side";
  vedioSrcList: any = [];
  audioSrcList: any = [];
  constraints = {
    audio: false,
    video: true
  };
  vdoSrc: MediaStream;
  selectedVdoSrc: any;
  selectedAdoSrc: any;
  peer: any;
  peerIdToConnect: String;
  localPeerId: String;

  constructor() {
    this.getConnectedDevices();
    this.registerEventListener();
    this.peer = new Peer();
    this.peer.on("call", this.handleRemoteCall);
    this.peer.on("open", this.assignLocalPeerID);
    this.peer.on("error", this.handlePeerError);
  }

  // Fetch an array of devices of a certain type
  getConnectedDevices = () => {
    let _this = this;
    navigator.mediaDevices
      .enumerateDevices()
      .then(this.setConnectedDevices)
      .catch(this.handleError);
  };

  localAdoVedioDevice = () => {
    let _this = this;
    const constraints: any = {};
    if (this.selectedVdoSrc) {
      constraints.video = {
        deviceId: this.selectedVdoSrc
          ? { exact: this.selectedVdoSrc }
          : undefined
      };
    }
    if (this.selectedAdoSrc) {
      constraints.audio = {
        deviceId: this.selectedAdoSrc
          ? { exact: this.selectedAdoSrc }
          : undefined,
        echoCancellation: true
      };
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream: MediaStream) {
        _this.vdoSrc = stream;
      })
      .catch(function(e) {
        console.log("Error:", e);
      });
  };

  setConnectedDevices = devices => {
    this.vedioSrcList = devices.filter(device => device.kind === "videoinput");
    this.audioSrcList = devices.filter(device => device.kind === "audioinput");
    // console.log(this.audioSrcList);
  };

  handleError = e => {
    console.error("Error:", e);
  };

  registerEventListener = () => {
    // Listen for changes to media devices and update the list accordingly
    navigator.mediaDevices.addEventListener("devicechange", event => {
      this.getConnectedDevices();
    });
  };

  onAdoVedioSelect = () => {
    this.localAdoVedioDevice();
  };

  callPeer = () => {
    console.log(this.peerIdToConnect);
    try {
      const call = this.peer.call(this.peerIdToConnect, this.vdoSrc);
      call.on("stream", function(remoteStream) {
        // Show stream in some video/canvas element.
        console.log("Connected to remote Stream");
      });
    } catch (e) {
      console.log("Error Thrown", e);
    }
  };

  handleRemoteCall = call => {
    call.answer(this.vdoSrc); // Answer the call with an A/V stream.
    call.on("stream", function(remoteStream) {
      // Show stream in some video/canvas element.
      console.log("Connected to remote Stream");
    });
  };

  assignLocalPeerID = id => {
    this.localPeerId = id;
    console.log("Local Peer ID:", id);
  };

  handlePeerError = reason => {
    console.log("Error:", reason);
  };
}
