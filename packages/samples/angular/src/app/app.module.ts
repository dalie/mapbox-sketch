import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxMapboxSketchModule } from '@mapbox-sketch/ngx-mapbox-sketch';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [BrowserModule, NgxMapboxSketchModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
