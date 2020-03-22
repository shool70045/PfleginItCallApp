import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.sass"]
})
export class AppComponent {
  title = "PfleginItCallApp";
  vedioSrc = [
    {
      value: "0",
      text: "Video Src 1"
    }
  ];
}
