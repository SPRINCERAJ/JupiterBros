import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router'; // Import RouterModule and Routes
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';
import { ProjectComponent } from './project/project.component';

// Define your routes
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'user', component: UserComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/project', component: ProjectComponent },
  {path:'dashboard',component:DashboardComponent}
];

@NgModule({
  declarations: [
    AppComponent,       // Add AppComponent
    LoginComponent,     // Add LoginComponent
    UserComponent,      // Add UserComponent
    AdminComponent,
    DashboardComponent      // Add AdminComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes) // Configure RouterModule with routes
  ],
  providers: [],
  bootstrap: [AppComponent] // Set AppComponent as the bootstrap component
})
export class AppModule { }
