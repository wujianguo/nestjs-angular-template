import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageComponent } from './components/page/page.component';
import { HeaderComponent } from './components/header/header.component';
import { NbActionsModule, NbButtonModule, NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuModule, NbSelectModule, NbSidebarModule, NbUserModule } from '@nebular/theme';


@NgModule({
  declarations: [
    PageComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule,
    NbLayoutModule,
    NbSidebarModule,
    NbButtonModule,
    NbSelectModule,
    NbActionsModule,
    NbUserModule,
    NbContextMenuModule,
    NbIconModule,
    // NbEvaIconsModule,
    NbMenuModule,
  ],
  exports: [
    HeaderComponent,
  ]
})
export class ThemeModule { }
