import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  displayedUsers: any[] = [];
  filters = { department: '', businessUnit: '' };
  searchQuery = '';
  adminname = '';
  newUser = {
    username: '',
    email: '',
    phone: '',
    department: '',
    businessUnit: '',
    role: '',
    password: ''
  };
  adminuserId: string = '';
  admin: any = {};

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadUsers();
    this.route.queryParams.subscribe((params) => {
      this.adminuserId = params['userId'];
    });
    this.userService.getUserById(this.adminuserId).subscribe(
      (response) => {
        this.admin = response;
        this.adminname = this.admin.username;
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((data) => {
      this.users = data;
      this.displayedUsers = [...this.users];
    });
  }

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase();
    const { department, businessUnit } = this.filters;

    this.displayedUsers = this.users.filter((user) => {
      const matchesQuery =
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesDepartment = department ? user.department === department : true;
      const matchesBusinessUnit = businessUnit ? user.businessUnit === businessUnit : true;

      return matchesQuery && matchesDepartment && matchesBusinessUnit;
    });
  }

  addUser(): void {
    this.userService.addUser(this.newUser).subscribe(() => {
      this.loadUsers();
    });
  }

  deleteUser(id: string): void {
    this.userService.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

  scrollByPercentage(percentage: number): void {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTo = (scrollHeight * percentage) / 100;
    window.scrollTo({ top: scrollTo, behavior: 'smooth' });
  }

  routetoproject(): void {
    this.router.navigate(['/admin/project'], { queryParams: { userId: this.admin._id } });
  }

  admin_as_user(): void {
    this.router.navigate(['/user'], { queryParams: { userId: this.adminuserId } });
  }
  open_dashboard():void{
    this.router.navigate(['/dashboard'], { queryParams: { userId: this.adminuserId } });
  }
}
