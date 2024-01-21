let balls = [];
let radius = 175; // Smaller radius
let gravity = 0.05; // Adjusted gravity
let dampingX = 1; // No damping in x-axis motion
let dampingY = 1.0; // No damping in y-axis motion
let minSpeed = 3;
let maxSpeed = 7;
let growthRate = 0.7; // Adjusted growth rate
let bounceModifier = 1.026; // Bounce modifier (adjust as needed)
let isFullSize = false;
let countdown = 3; // Countdown timer in seconds
let currentBallIndex = 0; // Index of the current ball
let isFirstBallCreated = false; // Flag to check if the first ball is created/
let hue = Math.floor(Math.random() * 360);
/*
let osc;
let t1 = 0.1; // attack time in seconds
let l1 = 0.4; // attack level 0.0 to 1.0
let t2 = 0.6; // decay time in seconds
let l2 = 0.02; // decay level  0.0 to 1.0
let env;
*/
let note = 0;

let sampler;

let lockout = new Date();
// create a variable called notes equal to the array stored in notes.json, this is running in the browser so we can't use require
let notes;

console.log("loaded")

function preload() {
  fetch('notes.json').then(response => response.json()).then(data => notes = data);
}

function setup() {
  console.log("notes", notes)
  userStartAudio();
  sampler = new Tone.Sampler({
          "D4": "fart-with-reverb.mp3", // Assign your audio file to a key
  });
  sampler.connect(Tone.Master)

  createCanvas(1080/2, 1920/2);
  background(0); // Set background color to black
  let angle = random(-PI);


  let startColor = color(`hsl(${hue}, 100%, 50%)`);
 // env = new p5.Envelope(t1, l1, t2, l2);
  // Calculate the initial position within the boundary
  let xOffset = cos(angle) * radius;
  let yOffset = sin(angle) * radius;

  // Ensure the initial position is centered away from the sides
  let x = constrain(width / 2 + xOffset, radius, width - radius);
  let y = constrain(height / 2 + yOffset, radius, height - radius);

//  osc = new p5.Oscillator();

  balls.push(new Ball(x, y, 20, startColor, minSpeed)); // Random color for the first ball
  isFirstBallCreated = true; // Set the flag to true
}

function playNote(note) {
  sampler.triggerAttackRelease(note, "1n");
}

function draw() {
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
      hue > 359 ? hue = 0 : hue++;
      balls[i].setColor(color(`hsl(${hue}, 100%, 50%)`));
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
      this.spawnNewBall(new Date)
      return true; // Return true to indicate a collision
    }
    return false; // Return false if no collision
  }

  spawnNewBall() {
      let angle = random(-PI);

      let xOffset = cos(angle) * radius;
      let yOffset = sin(angle) * radius;

      // Ensure the initial position is centered away from the sides
      let x = constrain(width / 2 + xOffset, radius, width - radius);
      let y = constrain(height / 2 + yOffset, radius, height - radius);


      if(new Date - lockout > 50){
        playNote(notes[note]);
        note === notes.length - 1 ? note = 0 : note++
        lockout = new Date();
      }
  }

  display() {
    noStroke(); // Remove the outline for the fill
    fill(this.color);
    ellipse(this.x, this.y, this.radius*1.5);
    stroke(0); // Set stroke color to black for the outline
    strokeWeight(2);
    noFill(); // Remove the fill for the outline
    ellipse(this.x, this.y, this.radius * 1.5);
  }
}

