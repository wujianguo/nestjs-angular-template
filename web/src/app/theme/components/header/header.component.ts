import { Component, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { map, Subject, takeUntil } from 'rxjs';
import { UserResponseDto } from 'src/app/user/dto/user.dto';

type ThemeType = 'default' | 'dark';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private destroy$: Subject<void> = new Subject<void>();
  themes = {
    default: {
      value: 'default',
      icon: 'moon-outline',
    },
    dark: {
      value: 'dark',
      icon: 'sun-outline',
    }
  };

  currentTheme = 'default';
  themeIcon = 'sun-outline';

  userMenu = [ { title: 'Profile' }, { title: 'Log out' } ];
  user?: UserResponseDto;

  constructor(private readonly themeService: NbThemeService) { }

  ngOnInit(): void {
    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => {
        this.currentTheme = themeName;
        this.themeIcon = this.themes[themeName as ThemeType].icon;
      });
    const theme = localStorage.getItem('theme');
    if (theme && theme !== 'default') {
      this.themeService.changeTheme(theme);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeLanuage() {
    console.log('changeLanuage');
  }

  changeTheme() {
    const themeName = this.currentTheme === 'default' ? 'dark' : 'default';
    this.themeService.changeTheme(themeName);
    localStorage.setItem('theme', themeName);
  }

}
