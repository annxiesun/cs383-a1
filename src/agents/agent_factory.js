import { LineAgent } from './line_agent'
import { OPTIONS } from '../sketch'
import findIntersections from 'bentley-ottman-sweepline'
import { extract_cycles } from '../cycles'
import { Line } from './line'
import bounds from 'binary-search-bounds'

function cmp_2nd(a,b) {
  return a[1] - b[1]
}
export class LineAgentFactory {
  constructor(p) {
    this.lineAgents = []
    this.activeLineAgent = null

    this.drawnLines = [
      {
        points: [
          [0, -1, 0],
          [2, 1, OPTIONS.height],
        ],
        line: new Line(this, 999, 0),
      },
      {
        points: [
          [0, 0, 0],
          [1, OPTIONS.width, 0],
        ],
        line: new Line(this, 0, 0),
      },
      {
        points: [
          [2, 0, OPTIONS.height],
          [3, OPTIONS.width + 1, OPTIONS.height],
        ],
        line: new Line(this, 0, OPTIONS.height),
      },
      {
        points: [
          [1, OPTIONS.width - 1, 0],
          [3, OPTIONS.width + 1, OPTIONS.height],
        ],
        line: new Line(this, 999, 0, -600),
      },
    ]

    this.intersections = [
      { x: 0, y: 0, adj: [] },
      { x: OPTIONS.width, y: 0, adj: [] },
      { x: 0, y: OPTIONS.height, adj: [] },
      { x: OPTIONS.width, y: OPTIONS.height, adj: [] },
    ]

    this.graph = new Map()

    this.graph.set(0, [1, 2])
    this.graph.set(2, [0, 3])
    this.graph.set(1, [0, 3])
    this.graph.set(3, [1, 2])

    console.log('IV', this.graph)
    this.p = p
  }

  nextAgent() {
    if (this.lineAgents.length !== 0) {
      this.activeLineAgent = this.lineAgents.pop()
    } else {
      this.activeLineAgent = null
    }
  }

  getIntersecting(v_currLine, cmp_line) {
    if (
      v_currLine.x > 589 &&
      cmp_line.m == 999 &&
      cmp_line.x_intercept == 600
    ) {
      this.p.fill(100)
      this.p.circle(Math.floor(600), Math.floor(v_currLine.y), 20)
      return [600, Math.floor(v_currLine.y)]
    }

    const c1 = v_currLine.m * v_currLine.x_intercept + v_currLine.y_intercept
    const c2 = cmp_line.m * cmp_line.x_intercept + cmp_line.y_intercept
    const i_x = (c1 - c2) / (cmp_line.m - v_currLine.m)

    const i_y = cmp_line.m * (i_x + cmp_line.x_intercept) + cmp_line.y_intercept
    this.p.fill(100)
    this.p.circle(Math.floor(i_x), Math.floor(i_y), 20)
    return [i_x, Math.floor(i_y)]
  }

  // every line needs to have an ordered set of intersection points by x
  // need to
  findClosestLower(pairArray, target) {
    return bounds.le(pairArray, target)
  }

  findClosestAbove(pairArray, target) {
    return bounds.ge(pairArray, target)
  }

  turnGraphIntoVertices() {
    const v_arr = []
    const v_set = new Set()
    for (const [key, value] of this.graph.entries()) {
      for (var i = 0; i < value.length; i++) {
        if (v_set.has(`${key}-${value[i]}`) || v_set.has(`${value[i]}-${key}`))
          continue
        v_arr.push([key, value[i]])
        v_set.add(`${key}-${value[i]}`)
      }
    }
    return v_arr
  }

  
  onFinishActiveAgent() {
    const v_currLine = this.activeLineAgent.line

    const thisLinePoints = []

    let prevPoint = null
    let old_i = null

    this.drawnLines.forEach((cmp_line, i) => {
      const [i_x, i_y] = this.getIntersecting(v_currLine, cmp_line.line)
      console.log("intersection", i_x,i_y)
      if (i_x > OPTIONS.width + 10 || i_y > OPTIONS.height || i_x < 0 || i_y < 0)
        return
      const intersectObj = {
        x: i_x,
        y: i_y,
        adj: [],
      }

      this.intersections.push(intersectObj)
      const new_i = this.intersections.length - 1
      thisLinePoints.push([new_i, i_x, i_y])

      if (prevPoint) {
        intersectObj.adj.push(intersectObj)
        const oldAdj = this.graph.get(old_i)
        oldAdj.push(new_i)
      }

      const onlyX = cmp_line.points.map((x) => x[1])
      const prev = this.findClosestLower(onlyX, i_x)
      const next = this.findClosestAbove(onlyX, i_x)

      const beforePoint_i = cmp_line.points[prev][0]
      const afterPoint_i = cmp_line.points[next][0]

      console.log("IMPORTANT cmp_line.points", i_x, cmp_line.points[prev], cmp_line.points[next])
      console.log("IMPORTANT cmp_line.points", this.graph)

      const adj1 = this.graph.get(beforePoint_i)
      const adj2 = this.graph.get(afterPoint_i)

      /* graph starts changing */
      const toR_before_i = adj2.indexOf(beforePoint_i)
      const toR_after_i = adj1.indexOf(afterPoint_i)

      console.log("DEBUGGING...",  adj2, beforePoint_i, toR_before_i, adj1, afterPoint_i, toR_after_i)

      adj2.splice(toR_before_i, 1)
      adj1.splice(toR_after_i, 1)

      adj1.push(new_i)
      adj2.push(new_i)

      const newArr = [beforePoint_i, afterPoint_i]
      if(old_i) newArr.push(old_i)
      this.graph.set(new_i, newArr)
      /* graph done changing */
      cmp_line.points.splice(prev, 0, [new_i, i_x, i_y])
      cmp_line.points.sort(cmp_2nd)
      
      prevPoint = intersectObj
      old_i = new_i
    })
    thisLinePoints.sort(cmp_2nd)

    const edges = this.turnGraphIntoVertices()
    console.log(edges)
    this.drawnLines.push({ points: thisLinePoints, line: v_currLine })

    console.log('vertices', this.intersections)
    edges.forEach((i) => {
      const [i1, i2] = i
      let v1 = this.intersections[i1],
        v2 = this.intersections[i2]
      v1.adj.push(v2)
      v2.adj.push(v1)
    })
    console.log(this.drawnLines)
    console.log(this.graph)
    const cycles = extract_cycles(this.intersections)
    
    cycles.forEach((cycle) => {
      this.p.fill(120,  Math.random() * 300, Math.random() * 300)

      this.p.beginShape("POINTS")
      cycle.forEach((v) => {
        this.p.vertex(v.x, v.y)
      })
      this.p.endShape()
    })
    this.nextAgent()
  }
  createAgents() {
    this.lineAgents = []

    for (let i = 0; i < OPTIONS.agentNum; i++) {
      let a = new LineAgent(this)
      this.lineAgents.push(a)
    }

    this.activeLineAgent = this.lineAgents.pop()
    // this.activeLineAgent = new LineAgent(this, new Line(this, 9999, 0, -600))
  }

  updateAgents() {
    this.activeLineAgent?.update()
  }

  drawAgents() {
    this.activeLineAgent?.draw(this.p)
  }
}
