import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import User from '../../models/user';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.scss']
})

export class LoginComponent {
    private user: User;

    @ViewChild('email') emailEle: ElementRef;
    @ViewChild('password') passwordEle: ElementRef;

    prompt = {type: 'error', message: ''};
    currentLoginMethod = 'Username';
    altLoginMethod = 'Email';

    constructor(private userService: UserService) {
    }

    toggleLoginMethod() {
        [this.currentLoginMethod, this.altLoginMethod] = [this.altLoginMethod, this.currentLoginMethod];
    }

    login() {
        const pwd = this.passwordEle.nativeElement.value;
        const credential = {password: pwd};
        const email = this.emailEle.nativeElement.value;

        if (email === '' || pwd === '') {
            this.prompt.type = 'error';
            this.prompt.message = 'Please fill in your username/email and password';
            return;
        }
        if (this.currentLoginMethod === 'Email') {
            credential['email'] = email;
        } else {
            credential['username'] = email;
        }
        this.userService.login(credential)
            .then(user => {
                this.prompt.type = 'normal';
                this.prompt.message = `Hi ${user.username}, welcome back.`;
            })
            .catch(err => {
                this.prompt.type = 'error';
                this.prompt.message = err;
            });
    }

    signup() {
    }
}
