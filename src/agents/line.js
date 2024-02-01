import { OPTIONS } from "../sketch"

export class Line {
  constructor(factory, m, y_intercept, x_intercept=0) {
    this.factory = factory 

    this.m = m
    this.x_intercept = x_intercept
    this.y_intercept = y_intercept
    this.x = 0
    this.y = y_intercept
  }

  getNext() {
    this.x += 10
    this.y  = (this.x * this.m) + this.y_intercept
    if(this.y <= 0 || this.y >= window.innerHeight || this.x > window.innerWidth) {
      if(this.x < 50) {
        this.factory.nextAgent()
        return
      }
      this.factory.onFinishActiveAgent()
    }
  }
}