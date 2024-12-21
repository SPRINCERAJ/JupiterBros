import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private userService: UserService, private router: Router) {}

  login(): void {
    this.userService.login(this.username, this.password).subscribe(
      (response) => {
        const { user } = response;
        if (user.role === "ADMIN") {
          this.router.navigate(['/admin'],{ queryParams: { userId: user._id } });
        } else {
          this.router.navigate(['/user'],{ queryParams: { userId: user._id } });
        }
      },
      (error) => {
        this.errorMessage = 'Invalid username or password.';
      }
    );
  }
}
