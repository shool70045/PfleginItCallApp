import { Component, AbstractType, OnInit } from "@angular/core";
declare var Peer: any;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.sass"]
})
export class AppComponent implements OnInit {
  title: string = "PfleginItCallApp";
  sideBarMode = "side";
  vedioSrcList: any = [];
  audioSrcList: any = [];
  constraints = {
    audio: false,
    video: true
  };
  vdoSrc: MediaStream;
  remoteVdoSrc: MediaStream;
  selectedVdoSrc: any;
  selectedAdoSrc: any;
  peer: any;
  peerIdToConnect: string;
  localPeerId: string;
  peerConf = {
    host: "128.199.40.86",
    port: 9000,
    path: "peerserver"
  };
  ifMuteAudio: boolean = true;
  ifMuteVideo: boolean = false;
  ifCallInProgress: boolean = false;
  vdoCallEvent: any;

  constructor() {
    this._initializePeer();
  }

  _initializePeer = () => {
    this.peer = new Peer(this.peerConf);
    this.peer.on("call", this.handleRemoteCall);
    this.peer.on("open", this.assignLocalPeerID);
    this.peer.on("error", this.handlePeerError);
  };

  ngOnInit(): void {
    this.getConnectedDevices();
    this.registerEventListener();
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
        echoCancellation: true,
        noiseSuppression: true
      };
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream: MediaStream) {
        _this.vdoSrc = stream;
        _this.muteCurrentAudio(_this.ifMuteAudio);
      })
      .catch(function(e) {
        console.log("Error:", e);
      });
  };

  muteCurrentAudio = ifMute => {
    this.ifMuteAudio = ifMute;
    this.vdoSrc.getAudioTracks()[0].enabled = !ifMute;
  };

  muteCurrentVideo = ifMute => {
    this.ifMuteVideo = ifMute;
    this.vdoSrc.getVideoTracks()[0].enabled = !ifMute;
  };

  setConnectedDevices = devices => {
    this.vedioSrcList = devices.filter(device => device.kind === "videoinput");
    this.audioSrcList = devices.filter(device => device.kind === "audioinput");
    console.log("SRC:", this.audioSrcList);
    //select default vedio and audio src
    if (this.vedioSrcList && this.vedioSrcList.length > 0) {
      this.selectedVdoSrc = this.vedioSrcList[0].deviceId;
    }
    if (this.audioSrcList && this.audioSrcList.length > 0) {
      this.selectedAdoSrc = this.audioSrcList[0].deviceId;
    }
    this.localAdoVedioDevice();
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
    let _this = this;
    // console.log(this.peerIdToConnect);
    try {
      this.vdoCallEvent = this.peer.call(this.peerIdToConnect, this.vdoSrc);
      this.vdoCallEvent.on("stream", function(remoteStream) {
        // Show stream in some video/canvas element.
        // console.log("Connected to remote Stream");
        _this.remoteVdoSrc = remoteStream;
        _this.ifCallInProgress = true;
      });
      this.vdoCallEvent.on("close", function() {
        _this.ifCallInProgress = false;
      });
    } catch (e) {
      console.log("Error Thrown", e);
    }
  };

  handleRemoteCall = call => {
    let _this = this;
    call.answer(this.vdoSrc); // Answer the call with an A/V stream.
    call.on("stream", function(remoteStream) {
      // Show stream in some video/canvas element.
      console.log("Connected to remote Stream");
      _this.remoteVdoSrc = remoteStream;
    });
    call.on("close", function(remoteStream) {
      _this.remoteVdoSrc = null;
    });
  };

  assignLocalPeerID = id => {
    this.localPeerId = id;
    console.log("Local Peer ID:", id);
  };

  handlePeerError = reason => {
    console.log("Error:", reason);
  };

  /* To copy any Text */
  copyPeerIdText() {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = this.localPeerId;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
  }

  endAllCall = () => {
    this.ifCallInProgress = false;
    this.vdoCallEvent.close();
    this.peer.destroy();
    // this._initializePeer();
  };
}
