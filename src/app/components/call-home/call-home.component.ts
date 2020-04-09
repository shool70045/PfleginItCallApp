import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../environments/environment";
import { ActivatedRoute } from "@angular/router";

declare var Peer: any;
declare var navigator: any;

@Component({
  selector: "app-call-home",
  templateUrl: "./call-home.component.html",
  styleUrls: ["./call-home.component.sass"]
})
export class CallHomeComponent implements OnInit {
  title: string = "PfleginItCallApp";
  sideBarMode = "side";
  vedioSrcList: any = [];
  audioSrcList: any = [];
  constraints = {
    audio: false,
    video: true
  };
  avStream: MediaStream;
  localVStream: MediaStream;
  remoteVdoSrc: MediaStream;
  selectedVdoSrc: any;
  selectedAdoSrc: any;
  peer: any;
  peerIdToConnect: string;
  localPeerId: string;
  peerConf = environment.peerConf;
  ifMuteAudio: boolean = false;
  ifMuteVideo: boolean = false;
  ifCallInProgress: boolean = false;
  remoteMediaConnection: any;
  remoteConnectionArr: any = [];
  joinLink: string;
  shareLink: string;
  isScreenSharing: boolean = false;
  remoteVdoSrcList: Array<any> = [];
  // acceptedCall: any;

  constructor(public toastr: ToastrService, private route: ActivatedRoute) {
    this.joinLink = this.route.snapshot.paramMap.get("joinLink");
  }

  _initializePeer = () => {
    this.peer = new Peer(this.peerConf);
    this.peer.on("call", this.handleRemoteCall);
    this.peer.on("open", this.assignLocalPeerID);
    // this.peer.on("connection", this.remoteConnectedHandle);
    this.peer.on("error", this.handlePeerError);
  };

  ngOnInit(): void {
    this.getConnectedDevices();
    this.registerEventListener();
  }

  // remoteConnectedHandle = (dataConnection: any) => {
  //   this.remoteConnectionArr.push(dataConnection);
  //   this.toastr.success("A peer connected.", "Success!");
  // };

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
        _this.avStream = stream;
        _this.localVStream = new MediaStream(stream.getVideoTracks());
        _this.muteCurrentAudio(_this.ifMuteAudio);
        if (!_this.peer) _this._initializePeer();
        if (_this.joinLink && _this.joinLink.trim().length > 0) {
          //Connect to the provided peer
          console.log("Joining Link--:", _this.joinLink);
          _this.peerIdToConnect = _this.joinLink;
          _this.callPeer();
        }
      })
      .catch(function(e) {
        console.log("Error:", e);
      });
  };

  muteCurrentAudio = ifMute => {
    this.ifMuteAudio = ifMute;
    this.avStream.getAudioTracks()[0].enabled = !ifMute;
    this.updateStreamInCall(this.avStream.getAudioTracks()[0], "audio");
  };

  muteCurrentVideo = ifMute => {
    this.ifMuteVideo = ifMute;
    this.avStream.getVideoTracks()[0].enabled = !ifMute;
    this.updateStreamInCall(this.avStream.getVideoTracks()[0], "video");
  };

  updateStreamInCall = (trackToReplace, type) => {
    if (
      this.remoteMediaConnection &&
      this.remoteMediaConnection.peerConnection
    ) {
      console.log(
        "Sender",
        this.remoteMediaConnection.peerConnection.getSenders()
      );
      this.remoteMediaConnection.peerConnection.getSenders().forEach(sender => {
        if (sender.track.kind == type) {
          sender.replaceTrack(trackToReplace);
        }
      });
    }
  };

  setConnectedDevices = devices => {
    console.log("Devices:", devices);
    this.vedioSrcList = devices.filter(device => device.kind === "videoinput");
    this.audioSrcList = devices.filter(device => device.kind === "audioinput");
    // console.log("SRC:", this.audioSrcList);
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
    try {
      this.remoteMediaConnection = this.peer.call(
        this.peerIdToConnect,
        this.avStream
      );
      this.remoteMediaConnection.on("stream", remoteStream => {
        // Show stream in some video/canvas element.
        // console.log("Connected to remote Stream");
        _this.toastr.success("You are now connected.", "Connected");
        _this.remoteVdoSrc = remoteStream;

        // console.log(remoteStream.getVideoTracks());

        // _this.remoteVdoSrc = remoteStream;

        _this.ifCallInProgress = true;
        // _this.avStream.getTracks().forEach(track => {
        //   _this.avStream.removeTrack(track);
        // });
      });
      this.remoteMediaConnection.on("close", () => {
        _this.ifCallInProgress = false;
        _this.toastr.warning("Call ended.");
      });
      this.remoteMediaConnection.on("error", () => {
        _this.ifCallInProgress = false;
        _this.toastr.error("Unable to connect to Peer.", "Error!");
      });
    } catch (e) {
      console.log("Error Thrown", e);
    }
  };

  handleRemoteCall = call => {
    let _this = this;
    this.remoteConnectionArr.push(call);
    call.answer(this.avStream);
    call.on("stream", remoteStream => {
      _this.remoteVdoSrc = remoteStream;
    });
    call.on("close", () => {
      _this.remoteVdoSrc = null;
    });
    call.on("error", err => {
      _this.remoteVdoSrc = null;
      console.error(err);
    });
  };

  assignLocalPeerID = id => {
    this.localPeerId = id;
    this.shareLink = environment.shareLinkPre + id;
    this.toastr.success("Peer initialized.", "Success!");
  };

  handlePeerError = reason => {
    console.log("Error:", reason);
    this.toastr.error(
      "Can not connect to Peer. The Peer is either offline or your internet is unstable.",
      "Oops!"
    );
  };

  copyShareLink = () => {
    this.copyText(this.shareLink);
  };

  copyPeerIdText = () => {
    this.copyText(this.localPeerId);
  };

  /* To copy any Text */
  copyText(text) {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
  }

  endCall = () => {
    this.ifCallInProgress = false;
    this.remoteMediaConnection.close();
    // this.peer.close();
    // this.peer.destroy();
    // this._initializePeer();
  };

  endAllCalls = () => {
    this.remoteConnectionArr.forEach(dataConnection => {
      dataConnection.close();
    });
    this.remoteConnectionArr = [];
  };

  shareScreen = () => {
    const _this = this;
    const mediaDevices = navigator.mediaDevices;
    if (mediaDevices) {
      mediaDevices.getDisplayMedia({ video: true }).then(stream => {
        _this.isScreenSharing = true;
        if (_this.avStream) {
          _this.avStream.removeTrack(_this.avStream.getVideoTracks()[0]);
          _this.avStream.addTrack(stream.getVideoTracks()[0]);
        }
      });
    }
  };

  stopShareScreen = () => {
    this.isScreenSharing = false;
    if (this.avStream) {
      this.avStream.removeTrack(this.avStream.getVideoTracks()[0]);
      this.avStream.addTrack(this.localVStream.getVideoTracks()[0]);
    }
  };

  switchVideo = () => {};
}
