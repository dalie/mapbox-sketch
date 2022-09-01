import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SketchComponent } from './sketch/sketch.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SketchComponent],
  providers:[SketchComponent],
  exports:[SketchComponent]
})
export class NgxMapboxSketchModule {}
