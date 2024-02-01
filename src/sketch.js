import { LineAgentFactory } from "./agents/agent_factory"
import { COLORS } from "./colors";

export const OPTIONS = {
  agentNum: 20,
  phase: 0
}

// Exporting a function called 'mySketch'
export const mySketch = (p) => {
  const lineAgentFactory = new LineAgentFactory(p)

  p.createAgents = () => {
    lineAgentFactory.createAgents();
  
  }
  p.setup = () => {
    console.log(window.p5)
    p.createCanvas(window.innerWidth, window.innerHeight);

    p.frameRate(30);

    p.colorMode(p.HSB)
    const bg = COLORS[OPTIONS.phase][0]
    p.background(bg[0], bg[1], bg[2]);
    p.createAgents()
    p.noStroke()
    
  }
  
  p.draw = () => {
    lineAgentFactory.updateAgents()
    lineAgentFactory.drawAgents()
  }
  
  p.keyPressed = () => {
    // space to reset all agents
    if (key == " ") {
      lineAgentFactory.createAgents();
    }
    // SHIFT-S saves the current canvas
    if (key == "S") {
      save("canvas.png");
    }
  }
  
  p.windowResized = () => {
    p.createAgents()
  }
  
  // global callback from the settings GUI
  p.paramChanged = (name) => {
      if(name === "color" && !p.monochrome) return
      if(name === "continuous" || name === "repeat") return
      p.createAgents()
  }

  const vertices = [{x: 0, y: 0, adj: []}, {x: 5, y: 5, adj: []}, {x: 5, y: 0, adj: []}, {x: 5, y: 2, adj: []}];

  // edges just define adjacent vertices for each vertex
}
