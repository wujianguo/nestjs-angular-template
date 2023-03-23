import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageComponent } from './components/page/page.component';
import { HeaderComponent } from './components/header/header.component';
import { NbActionsModule, NbIconModule, NbLayoutModule, NbMenuModule, NbSelectModule, NbSidebarModule, NbUserModule } from '@nebular/theme';


@NgModule({
  declarations: [
    PageComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule,
    NbLayoutModule,
    NbSidebarModule,
    NbSelectModule,
    NbActionsModule,
    NbUserModule,
    NbIconModule,
    // NbEvaIconsModule,
    NbMenuModule,
  ],
  exports: [
    HeaderComponent,
  ]
})
export class ThemeModule { }
