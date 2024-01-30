import { LineAgentFactory } from "./agents/agent_factory"
import findIntersections from "bentley-ottman-sweepline";
import { extract_cycles } from "./cycles";

export const OPTIONS = {
  agentNum: 20,
  width: 600,
  height: 600,
}

// Exporting a function called 'mySketch'
export const mySketch = (p) => {
  const lineAgentFactory = new LineAgentFactory(p)

  p.createAgents = () => {
    lineAgentFactory.createAgents();
  
  }
  p.setup = () => {
  
    p.createCanvas(OPTIONS.width, OPTIONS.height);

    // add params to a GUI

    p.frameRate(30);

    // load last params
    // s = getItem("params")

    // setup the window and create the agents
    p.background(250);
    p.colorMode("HSB", 360, 100,100,100)
    p.createAgents()
    p.noStroke()
    
  }
  
  p.draw = () => {
    lineAgentFactory.updateAgents()
    lineAgentFactory.drawAgents()
  
    //   fill(30,40,50)
    // beginShape(TESS);
    // vertex(0,20);
    // vertex(500,50);
    // vertex(400, 500);
    // vertex(200,500);
    // endShape(CLOSE);
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
  
  p.mousePressed = () => {
    [ [1,2], [1,3], [2,0], [2,3] ].forEach( (i) => {
      const [i1,i2]= i
        let v1 = vertices[i1], v2 = vertices[i2];
        v1.adj.push(v2);
        v2.adj.push(v1);
        console.log(v1,v2)
    });
  console.log(vertices)
  let result = extract_cycles(vertices);
  console.log(result)
  }
}
