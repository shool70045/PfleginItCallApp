import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CallHomeComponent } from "./components/call-home/call-home.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

const routes: Routes = [
  { path: ":joinLink", component: CallHomeComponent, pathMatch: "full" },
  { path: "", component: DashboardComponent, pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
