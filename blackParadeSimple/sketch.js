let balls = [];
let radius = 175; // Smaller radius
let gravity = 0.05; // Adjusted gravity
let dampingX = 1; // No damping in x-axis motion
let dampingY = 1.0; // No damping in y-axis motion
let minSpeed = 3;
let maxSpeed = 7;
let growthRate = 0.7; // Adjusted growth rate
let bounceModifier = 1.016; // Bounce modifier (adjust as needed)
let isFullSize = false;
let countdown = 3; // Countdown timer in seconds
let currentBallIndex = 0; // Index of the current ball
let isFirstBallCreated = false; // Flag to check if the first ball is created/
let hue = Math.floor(Math.random() * 360);
let osc;
let t1 = 0.01; // attack time in seconds
let l1 = 0.4; // attack level 0.0 to 1.0
let t2 = 1.3; // decay time in seconds
let l2 = 0.02; // decay level  0.0 to 1.0
let note = 0;
let env;
const noteFrequencies = {
  "A-1": 27.5,
  "A#-1": 29.14,
  "B-1": 30.87,
  C0: 32.7,
  "C#0": 34.65,
  D0: 36.71,
  "D#0": 38.89,
  E0: 41.2,
  F0: 43.65,
  "F#0": 46.25,
  G0: 49.0,
  "G#0": 51.91,
  A0: 55.0,
  "A#0": 58.27,
  B0: 61.74,
  C1: 65.41,
  "C#1": 69.3,
  D1: 73.42,
  "D#1": 77.78,
  E1: 82.41,
  F1: 87.31,
  "F#1": 92.5,
  G1: 98.0,
  "G#1": 103.83,
  A1: 110.0,
  "A#1": 116.54,
  B1: 123.47,
  C2: 130.81,
  "C#2": 138.59,
  D2: 146.83,
  "D#2": 155.56,
  E2: 164.81,
  F2: 174.61,
  "F#2": 185.0,
  G2: 196.0,
  "G#2": 207.65,
  A2: 220.0,
  "A#2": 233.08,
  B2: 246.94,
  C3: 261.63,
  "C#3": 277.18,
  D3: 293.66,
  "D#3": 311.13,
  E3: 329.63,
  F3: 349.23,
  "F#3": 369.99,
  G3: 392.0,
  "G#3": 415.3,
  A3: 440.0,
  "A#3": 466.16,
  B3: 493.88,
  C4: 523.25,
  "C#4": 554.37,
  D4: 587.33,
  "D#4": 622.25,
  E4: 659.26,
  F4: 698.46,
  "F#4": 739.99,
  G4: 783.99,
  "G#4": 830.61,
  A4: 880.0,
  "A#4": 932.33,
  B4: 987.77,
  C5: 1046.5,
  "C#5": 1108.73,
  D5: 1174.66,
  "D#5": 1244.51,
  E5: 1318.51,
  F5: 1396.91,
  "F#5": 1479.98,
  G5: 1567.98,
  "G#5": 1661.22,
  A5: 1760.0,
  "A#5": 1864.66,
  B5: 1975.53,
  C6: 2093.0,
  "C#6": 2217.46,
  D6: 2349.32,
  "D#6": 2489.02,
  E6: 2637.02,
  F6: 2793.83,
  "F#6": 2959.96,
  G6: 3135.96,
  "G#6": 3322.44,
  A6: 3520.0,
  "A#6": 3729.31,
  B6: 3951.07,
  C7: 4186.01,
};

let startDate = new Date();

let notes = [
  "G4", "F#4", "B4", "E4", "D4", "G4", "C4", "B3", "E4", "A3", "D4",
  "G4", "F#4", "B4", "E4", "D4", "G4", "C4", "B3", "F4", "A3", "D4",
  "D4", "G4", "D4",
  "G4", "F#4", "D4",
  "F#4", "G4", "D4",
  "F#4", "G4", "F#4", "E4", "D4", "E4", "C4",
  "F#4", "G4", "F#4", "E4", "D4", "C4",
  "D4", "E4", "G4", "D4", "G4", "F#4", "D4",
  "F#4", "G4", "D4", "F#4", "G4", "F#4", "E4", "D4", "E4", "C4",
  "F#4", "G4", "F#4", "E4", "D4", "C4",
  "D4", "E4", 'G4', 'D4', 'G4', 'F#4', 'D4',
  'F#4', 'G4', 'D4', 'F#4', 'G4', 'F#4', 'E4', 'D4', 'E4', 'C4',
  'F#4', 'G4', 'F#4', 'E4', 'D4', 'C4',
  'D4', 'E4', 'G4', 'D4', 'G4', 'F#4', 'D4',
  'F#4', 'G4', 'D4', 'F#4', 'G4', 'F#4', 'E4', 'D4', 'E4', 'C4',
  'F#4', 'G4', 'F#4', 'E4', 'D4', 'C4'
];
function setup() {
  createCanvas(1080/2, 1920/2);
  let angle = -.6;

  let startColor = color(`hsl(0, 100%, 50%)`);
  env = new p5.Envelope(t1, l1, t2, l2);
  // Calculate the initial position within the boundary
  let xOffset = cos(angle) * radius;
  let yOffset = sin(angle) * radius;

  // Ensure the initial position is centered away from the sides
  let x = constrain(width / 2 + xOffset, radius, width - radius);
  let y = constrain(height / 2 + yOffset, radius, height - radius);

  osc = new p5.Oscillator();

  balls.push(new Ball(x, y, 20, startColor, minSpeed)); // Random color for the first ball
  isFirstBallCreated = true; // Set the flag to true
}

function playNote(freq) {
  osc.freq(freq);
  osc.start()
  env.play(osc);
}
function draw() {
  background(0); // Set background color to black
  stroke(255); // Set stroke color to white
  noFill();
  strokeWeight(12); // Increase stroke weight to make the boundary thicker

  // Draw the boundary circle
  ellipse(width / 2, height / 2, radius * 2);

  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    ball.applyGravity();
    ball.move();
    let collision = ball.checkBoundaryCollision();
    ball.display();

    if (isFirstBallCreated && ball.radius >= radius * 1.5) {
      isFirstBallCreated = false; // Prevent creating more balls
    }
    if (collision) {
      //loop through the notes array
      
      hue += Math.round(1 / (balls[0].radius / 150));
      if (hue >= 360) {
        hue = 0;
      }
      balls[0].setColor(color(`hsl(${hue}, 100%, 50%)`)); // Change the color of the first ball
      playNote(noteFrequencies[notes[note]]);
      note === notes.length - 1 ? note = 0 : note++
    }
  }
}

class Ball {
  constructor(x, y, radius, color, initialSpeed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.initialRadius = radius;
    this.color = color;
    this.speed = initialSpeed;
    this.xSpeed = -.1 * initialSpeed;
    this.ySpeed = -.25 * initialSpeed;
    this.growthRate = growthRate;
  }

  applyGravity() {
    this.ySpeed += gravity;
  }

  move() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }
  setColor(color) {
    this.color = color;
  }

  checkBoundaryCollision() {
    let d = dist(this.x, this.y, width / 2, height / 2);
    if (d >= radius - this.radius) {
      let angle = atan2(this.y - height / 2, this.x - width / 2);
      let newX = width / 2 + cos(angle) * (radius - this.radius);
      let newY = height / 2 + sin(angle) * (radius - this.radius);
      let incomingAngle = atan2(-this.ySpeed, -this.xSpeed);
      let outgoingAngle = 2 * angle - incomingAngle;
      let speed = dist(0, 0, this.xSpeed, this.ySpeed);
      this.xSpeed = speed * cos(outgoingAngle) * bounceModifier;
      this.ySpeed = speed * sin(outgoingAngle) * bounceModifier;
      this.x = newX;
      this.y = newY;
      this.radius += this.growthRate;
      return true; // Return true to indicate a collision
    }
    return false; // Return false if no collision
  }

  display() {
    noStroke(); // Remove the outline for the fill
    fill(this.color);
    ellipse(this.x, this.y, this.radius*1.5);
    stroke(0); // Set stroke color to black for the outline
    noFill(); // Remove the fill for the outline
    noStroke();
    ellipse(this.x, this.y, this.radius * 1.5);
  }
}

