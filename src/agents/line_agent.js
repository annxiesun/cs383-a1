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
    this.angle = Math.floor((Math.random() * 40)+ 5);
    this.slope = this.getSlope(this.angle)
    this.line = new Line(this.factory, this.slope,  Math.floor(Math.random() * window.innerHeight))
  }

  reset() {}

  update() {
    this.line.getNext()
  }

  draw(p) {
    p.stroke(43, 23, 100);
    p.strokeWeight(2);
    p.line(this.line.x_intercept, this.line.y_intercept, this.line.x, this.line.y)
    p.strokeWeight(0);
  }
}
