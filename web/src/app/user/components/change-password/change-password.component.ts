import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  processing = false;
  passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
  });

  constructor(private readonly toastrService: NbToastrService, private readonly authService: AuthService) { }

  ngOnInit(): void {
  }

  changePassword(): void {
    const oldPassword = this.passwordForm.value.oldPassword || '';
    const newPassword = this.passwordForm.value.newPassword || '';
    // this.processing = true;
    this.authService.changePassword(oldPassword, newPassword).subscribe(res => {
      // this.processing = false;
      this.passwordForm.reset();
      this.toastrService.success('Password changed!', 'Success');
    });
  }
}
