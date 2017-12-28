/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NB_AUTH_OPTIONS_TOKEN } from '../../auth.options';
import { getDeepFromObject } from '../../helpers';

import { NbAuthResult, NbAuthService } from '../../services/auth.service';

@Component({
  selector: 'nb-register',
  styleUrls: ['./register.component.scss'],
  template: `
    <nb-auth-block>
      <h2 class="title">Cadastro de Usuário</h2>
      <form (ngSubmit)="register()" #form="ngForm">

        <div *ngIf="showMessages.error && errors && errors.length > 0 && !submitted"
             class="alert alert-danger" role="alert">
          <div><strong>Oh snap!</strong></div>
          <div *ngFor="let error of errors">{{ error }}</div>
        </div>
        <div *ngIf="showMessages.success && messages && messages.length > 0 && !submitted"
             class="alert alert-success" role="alert">
          <div><strong>Hooray!</strong></div>
          <div *ngFor="let message of messages">{{ message }}</div>
        </div>

        <div class="form-group">
          <label for="input-name" class="sr-only">Nome</label>
          <input name="name" [(ngModel)]="user.name" id="input-name" #name="ngModel"
                 class="form-control" placeholder="Informe seu Nome"
                 [class.form-control-danger]="name.invalid && name.touched"
                 [required]="getConfigValue('forms.validation.name.required')"
                 [minlength]="getConfigValue('forms.validation.name.minLength')"
                 [maxlength]="getConfigValue('forms.validation.name.maxLength')"
                 autofocus>
          <small class="form-text error" *ngIf="name.invalid && name.touched && name.errors?.required">
            Nome é obrigatório!
          </small>
          <small
            class="form-text error"
            *ngIf="name.invalid && name.touched && (name.errors?.minlength || name.errors?.maxlength)">
            O nome completo deve conter
            a partir de {{getConfigValue('forms.validation.password.minLength')}}
            até {{getConfigValue('forms.validation.password.maxLength')}}
            caracteres
          </small>
        </div>

        <div class="form-group">
          <label for="input-email" class="sr-only">Endereço de E-mail</label>
          <input name="email" [(ngModel)]="user.email" id="input-email" #email="ngModel"
                 class="form-control" placeholder="Informe o seu Endereço de E-mail" pattern=".+@.+\..+"
                 [class.form-control-danger]="email.invalid && email.touched"
                 [required]="getConfigValue('forms.validation.email.required')">
          <small class="form-text error" *ngIf="email.invalid && email.touched && email.errors?.required">
            E-mail é obrigatório!
          </small>
          <small class="form-text error"
                 *ngIf="email.invalid && email.touched && email.errors?.pattern">
            Email should be the real one!
          </small>
        </div>

        <div class="form-group">
          <label for="input-password" class="sr-only">Senha</label>
          <input name="password" [(ngModel)]="user.password" type="password" id="input-password"
                 class="form-control" placeholder="Informe a sua Senha" #password="ngModel"
                 [class.form-control-danger]="password.invalid && password.touched"
                 [required]="getConfigValue('forms.validation.password.required')"
                 [minlength]="getConfigValue('forms.validation.password.minLength')"
                 [maxlength]="getConfigValue('forms.validation.password.maxLength')">
          <small class="form-text error" *ngIf="password.invalid && password.touched && password.errors?.required">
            Senha é obrigatória!
          </small>
          <small
            class="form-text error"
            *ngIf="password.invalid && password.touched && (password.errors?.minlength || password.errors?.maxlength)">
            Password should contains
            from {{ getConfigValue('forms.validation.password.minLength') }}
            to {{ getConfigValue('forms.validation.password.maxLength') }}
            characters
          </small>
        </div>

        <div class="form-group">
          <label for="input-re-password" class="sr-only">Confirmação de Senha</label>
          <input
            name="rePass" [(ngModel)]="user.confirmPassword" type="password" id="input-re-password"
            class="form-control" placeholder="Confirme a sua Senha" #rePass="ngModel"
            [class.form-control-danger]="(rePass.invalid || password.value != rePass.value) && rePass.touched"
            [required]="getConfigValue('forms.validation.password.required')">
          <small class="form-text error"
                 *ngIf="rePass.invalid && rePass.touched && rePass.errors?.required">
            Confirmação de Senha é Obrigatória!
          </small>
          <small
            class="form-text error"
            *ngIf="rePass.touched && password.value != rePass.value && !rePass.errors?.required">
            Password does not match the confirm password.
          </small>
        </div>

        <div class="form-group accept-group col-sm-12" *ngIf="getConfigValue('forms.register.terms')">
          <nb-checkbox name="terms" [(ngModel)]="user.terms" [required]="getConfigValue('forms.register.terms')">
            Aceito os <a href="#" target="_blank"><strong>Termos & Condições</strong></a>
          </nb-checkbox>
        </div>

        <button [disabled]="submitted || !form.valid" class="btn btn-block btn-hero-success"
                [class.btn-pulse]="submitted">
          Enviar
        </button>
      </form>

      <div class="links">
        <small class="form-text">
          Já tem uma conta Think A.M.? <a routerLink="../login"><strong>Entre</strong></a>
        </small>
      </div>
    </nb-auth-block>
  `,
})
export class NbRegisterComponent {

  redirectDelay: number = 0;
  showMessages: any = {};
  provider: string = '';

  submitted = false;
  errors: string[] = [];
  messages: string[] = [];
  user: any = {};

  constructor(protected service: NbAuthService,
              @Inject(NB_AUTH_OPTIONS_TOKEN) protected config = {},
              protected router: Router) {

    this.redirectDelay = this.getConfigValue('forms.register.redirectDelay');
    this.showMessages = this.getConfigValue('forms.register.showMessages');
    this.provider = this.getConfigValue('forms.register.provider');
  }

  register(): void {
    this.errors = this.messages = [];
    this.submitted = true;

    this.service.register(this.provider, this.user).subscribe((result: NbAuthResult) => {
      this.submitted = false;
      if (result.isSuccess()) {
        this.messages = result.getMessages();
      } else {
        this.errors = result.getErrors();
      }

      const redirect = result.getRedirect();
      if (redirect) {
        setTimeout(() => {
          return this.router.navigateByUrl(redirect);
        }, this.redirectDelay);
      }
    });
  }

  getConfigValue(key: string): any {
    return getDeepFromObject(this.config, key, null);
  }
}
