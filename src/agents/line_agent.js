import { OPTIONS } from "../sketch";
import { Line } from "./line";

export class LineAgent {
   getSlope = (angle) => {
    return Math.tan(angle)
  }

  constructor(factory, line = false) {
    this.factory = factory
    if(line) {
      this.line = line
      return
    }
    this.initialize();
  }


  initialize() {
    this.angle = Math.floor(Math.random() * 10);
    this.slope = this.getSlope(this.angle)
    this.line = new Line(this.factory, this.slope,  Math.floor(Math.random() * OPTIONS.height))
  }

  reset() {}

  update() {
    this.line.getNext()
  }

  draw(p) {
    p.stroke(255, 204, 0);
    p.strokeWeight(10);
    p.line(this.line.x_intercept, this.line.y_intercept, this.line.x, this.line.y)
    p.strokeWeight(0);
  }
}
