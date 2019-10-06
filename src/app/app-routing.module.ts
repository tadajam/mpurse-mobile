import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: './pages/home/home.module#HomePageModule',
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'start',
    loadChildren: './pages/start/start.module#StartPageModule'
  },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginPageModule'
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
