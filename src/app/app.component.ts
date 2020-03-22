import { Component, AbstractType } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.sass"]
})
export class AppComponent {
  title: string = "PfleginItCallApp";
  vedioSrcList: any = [];
  constraints = {
    audio: false,
    video: true
  };
  vdoSrc: MediaStream;
  selectedVdoSrc: any;

  constructor() {
    // Get the initial set of cameras connected
    // this.vedioSrcList = this.getConnectedDevices("videoinput");
    this.getConnectedDevices();
    //this.registerEventListener();
  }

  // Fetch an array of devices of a certain type
  getConnectedDevices = () => {
    let _this = this;
    // const devices = await navigator.mediaDevices.enumerateDevices();
    // return devices.filter(device => device.kind === type);

    navigator.mediaDevices
      .enumerateDevices()
      .then(this.setConnectedDevices)
      .catch(this.handleError);
  };

  localVedioDevice = (videoSource: any) => {
    let _this = this;
    const constraints = {
      video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    };
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

  onVedioSelect = () => {
    // console.log("Sele:", this.selectedVdoSrc);
    this.localVedioDevice(this.selectedVdoSrc);
  };
}
