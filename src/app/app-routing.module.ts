import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from 'src/modules/auth/components/sign-in/sign-in.component';
import { SearchUserComponent } from 'src/modules/shared/components/search-user/search-user.component';
import { HttpErrorPageComponent } from 'src/modules/shared/components/http-error-page/http-error-page.component';
import { AuthenticationGuard } from 'src/services/shared/authentication.guard';

const routes: Routes = [
  {path:'login',component:SignInComponent},
  {path:'dashboard',component:SearchUserComponent,canActivate:[AuthenticationGuard]},
  {path:'404',component:HttpErrorPageComponent},
  {path:'',redirectTo:'dashboard',pathMatch:'full'},
  {path:'**',redirectTo:'404'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
