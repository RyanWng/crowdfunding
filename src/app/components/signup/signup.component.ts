import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-signup',
    templateUrl: 'signup.component.html',
    styleUrls: ['signup.component.scss']
})

export class SignupComponent implements OnInit {
    @ViewChild('username') usernameEle: ElementRef;
    @ViewChild('email') emailEle: ElementRef;
    @ViewChild('password') passwordEle: ElementRef;
    @ViewChild('rePassword') rePasswordEle: ElementRef;
    @ViewChild('location') locationEle: ElementRef;
    @ViewChild('checkbox') checkboxEle: ElementRef;
    @ViewChild('submit') submitEle: ElementRef;

    prompt = {type: 'error', message: ''};

    constructor(private userService: UserService,
                private router: Router) {
    }

    ngOnInit() {
        if (this.userService.isLoggedIn()) {
            this.router.navigateByUrl('projects', {queryParams: {creator: true}});
        }
    }

    setCheckbox(val: boolean): void {
        this.checkboxEle.nativeElement.checked = val;
    }

    private validatePassword(): boolean {
        const res = this.passwordEle.nativeElement.value === this.rePasswordEle.nativeElement.value;
        if (!res) {
            this.prompt.type = 'error';
            this.prompt.message = 'Two passwords are not identical.';
        }
        return res;
    }

    private validateEmail(email: string): boolean {
        if (!new RegExp(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/).test(email)) {
            this.prompt.type = 'error';
            this.prompt.message = 'Email address is invalid';
            return false;
        }
        return true;
    }

    signup(): void {
        if (!this.validatePassword()) {
            return;
        }
        const body = {
            username: this.usernameEle.nativeElement.value.trim(),
            email: this.emailEle.nativeElement.value.trim(),
            password: this.passwordEle.nativeElement.value.trim(),
        };
        if (!body.username || !body.email || !body.password || !this.validateEmail(body.email)) {
            return;
        }
        if (this.locationEle.nativeElement.value.trim() !== '') {
            body['location'] = this.locationEle.nativeElement.value;
        }
        this.submitEle.nativeElement.disabled = true;
        this.prompt.type = 'info';
        this.prompt.message = 'We are processing your request...';
        this.userService.signup(body)
            .then(user => {
                this.prompt.type = 'normal';
                this.prompt.message = `Hi ${user.username}! Thanks for signing up :)`;
                this.submitEle.nativeElement.disabled = false;
                setTimeout(() => this.router.navigateByUrl('/projects'), 1000);
            })
            .catch(err => {
                this.prompt.type = 'error';
                this.prompt.message = `Sorry, the username or email was registered by others.`;
                this.submitEle.nativeElement.disabled = false;
                console.error(err);
            });
    }
}
