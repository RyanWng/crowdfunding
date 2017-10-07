import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import User from '../models/user';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class UserService {
    private apiUrl = environment.apiUrl + 'users';
    user: User;
    userSubject = new Subject<User>(); // mainly used to notify the places where need to display user info.

    constructor(private http: HttpClient) {
    }

    private getUser(userId: number, token: string): Promise<User> {
        return new Promise<User>(((resolve, reject) => {
            this.http.get(`${this.apiUrl}/${userId}`, {
                observe: 'response',
                headers: new HttpHeaders().append('X-Authorization', token),
                responseType: 'text'
            }).subscribe(res => {
                if (res.status === 200) {
                    const body = JSON.parse(res.body);
                    this.storeUserSession(new User(body.id, body.username, body.location, body.email, token));
                    resolve(this.user);
                } else {
                    reject(res.body);
                }
            });
        }));
    }

    loadUserSession(): void {
        if (sessionStorage.getItem('user')) {
            this.user = User.restoreUser(JSON.parse(sessionStorage.getItem('user')));
            setTimeout(() => this.userSubject.next(this.user), 50);
        }
    }

    private storeUserSession(user: User): void {
        this.user = user;
        sessionStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(this.user); // notify observers
    }

    private removeUserSession(): void {
        this.user = null;
        sessionStorage.removeItem('user');
        this.userSubject.next(null); // notify observers
    }

    signup(body: {
        username: string,
        email: string,
        password: string,
        location?: string
    }): Promise<User> {
        return new Promise<User>(((resolve, reject) => {
            this.http.post(this.apiUrl, body, {
                observe: 'response',
                responseType: 'text'
            }).subscribe(res => {
                if (res.status === 201) {
                    resolve(this.login(body));
                } else {
                    reject(res.body);
                }
            }, err => reject(err.error));
        }));
    }

    login(credential: {
        username?: string,
        email?: string,
        password: string
    }): Promise<User> {
        let httpParams = new HttpParams;
        if (credential['username']) {
            httpParams = httpParams.append('username', credential.username);
        } else {
            httpParams = httpParams.append('email', credential.email);
        }
        httpParams = httpParams.append('password', credential.password);

        return new Promise<User>(((resolve, reject) => {
            this.http.post(`${this.apiUrl}/login`, null, {
                observe: 'response',
                params: httpParams,
                responseType: 'text'
            }).subscribe(res => {
                if (res.status === 200) {
                    const body = JSON.parse(res.body);
                    resolve(this.getUser(body.id, body.token));
                } else {
                    reject(res.body);
                }
            }, err => {
                reject(err.error);
            });
        }));
    }

    logout(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!this.user) {
                reject('You haven\'t logged in');
            } else {
                this.http.post(`${this.apiUrl}/logout`, null, {
                    headers: this.getHeaders(),
                    observe: 'response',
                    responseType: 'text'
                }).subscribe(res => {
                    if (res.status === 200) {
                        this.removeUserSession();
                        resolve(true);
                    } else {
                        reject(res.body);
                    }
                    // TODO: err is any not HttpErrorResponse
                }, err => reject(err.error));
            }
        });
    }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders().append('X-Authorization', this.user.token);
    }
}
