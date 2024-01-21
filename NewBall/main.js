// Adjustable Constants
const CANVAS_WIDTH = 800; // The width of the canvas
const CANVAS_HEIGHT = 1422; // The height of the canvas (9:16 aspect ratio)
const RING_DIAMETER = 775; // The diameter of the ring
const INITIAL_BALL_RADIUS = 2.5; // The initial radius of the bouncing ball
const INITIAL_SPEED = 5; // The initial speed of the bouncing ball (adjust as needed)
const GRAVITY = 0.1; // The gravitational force affecting the ball
const BOUNCE_DAMPENING = 1.008; // The dampening factor for bounce
const TRAIL_LENGTH = 1000; // The maximum length of the trail behind the ball
let GROWTH_DELAY_FRAMES = 1; // The delay in frames before the ball starts growing after each bounce
const GROWTH_PER_BOUNCE = 1.5; // The amount the ball grows in radius after each bounce
const MAX_RADIUS = 50; // Change this value to your desired maximum radius
const MIN_SPEED = 0; // The minimum allowed speed for the ball
const MAX_SPEED = 99999999999; // The maximum allowed speed for the ball
const TRAIL_STYLE = 'fading'; // Can be 'classic', 'dots', 'fading', 'spiral', 'wave', or 'randomDots'
const FART_OCTAVE = 3;

let MIDI_NOTES = [];
let NOTE_IDX = 0;


let sampler;

async function loadMIDINotes() {
  try {
    const response = await fetch('midi_notes.json'); // Replace with the correct path
    const data = await response.json();

    if (data.length) {
      MIDI_NOTES = data;
      console.log('Loaded MIDI notes:', MIDI_NOTES);
    } else {
      console.error('Failed to load MIDI notes from JSON file.');
    }
  } catch (error) {
    console.error('Error loading MIDI notes:', error);
  }
}

// Call the function to load MIDI notes
loadMIDINotes().then(() => {
  // Continue with the rest of your setup
  setup();
});

// Call the function to load MIDI notes
loadMIDINotes();


class Ball {
  constructor(radius, initialSpeed) {
    this.radius = radius;
    this.initialSpeed = initialSpeed;
    this.hue = 0;
    this.outlineHue = 180;
    this.trail = [];
    this.growthDelayCounter = 0;
    this.growthStarted = false;
    this.reset();
  }

  reset() {
    const initialAngle = random(-PI, PI);
    const speed = constrain(this.initialSpeed, MIN_SPEED, MAX_SPEED);
    this.vx = speed * cos(initialAngle);
    this.vy = speed * sin(initialAngle);
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
  }

  update() {
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;
    this.checkRingCollision();
    this.updateTrail();
  }

  checkRingCollision() {
    let distanceFromCenter = dist(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      this.x,
      this.y
    );
    let ringRadius = RING_DIAMETER / 2 - this.radius;

    if (distanceFromCenter >= ringRadius) {
      let angle = atan2(this.y - CANVAS_HEIGHT / 2, this.x - CANVAS_WIDTH / 2);
      let toCenterX = cos(angle);
      let toCenterY = sin(angle);

      let velocityDot = this.vx * toCenterX + this.vy * toCenterY;
      this.vx -= 2 * velocityDot * toCenterX * BOUNCE_DAMPENING;
      this.vy -= 2 * velocityDot * toCenterY * BOUNCE_DAMPENING;

      this.x = CANVAS_WIDTH / 2 + toCenterX * ringRadius;
      this.y = CANVAS_HEIGHT / 2 + toCenterY * ringRadius;

      this.growthDelayCounter = GROWTH_DELAY_FRAMES;
      this.growthStarted = true;

      playNote(MIDI_NOTES[NOTE_IDX]);
      NOTE_IDX === MIDI_NOTES.length - 1 ? NOTE_IDX = 0 : NOTE_IDX++;
    }
  }

  updateTrail() {
    this.trail.push({ x: this.x, y: this.y, hue: this.hue });
    if (this.trail.length > TRAIL_LENGTH) {
      this.trail.shift();
    }

    if (this.growthDelayCounter <= 0 && this.growthStarted) {
      this.radius += GROWTH_PER_BOUNCE;
      this.growthStarted = false;

      if (this.radius >= MAX_RADIUS) {
        GROWTH_DELAY_FRAMES = 0;
      }
    } else if (this.growthDelayCounter > 0) {
      this.growthDelayCounter--;
    }
  }

  display() {
    this.hue = (this.hue + 1) % 360;
    this.outlineHue = (this.hue + 180) % 360;

    switch (TRAIL_STYLE) {
        case 'classic':
            this.displayClassicTrail();
            break;
        case 'dots':
            this.displayDotsTrail();
            break;
        case 'fading':
            this.displayFadingTrail();
            break;
        case 'spiral':
            this.displaySpiralTrail();
            break;   
        case 'wave':
            this.displayWaveTrail();
            break;
        case 'randomDots':
            this.displayRandomDotsTrail();
            break;
    }

    stroke(this.outlineHue, 100, 100);
    strokeWeight(6);
    fill(this.hue, 100, 100);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
}

displayClassicTrail() {
    for (let i = 0; i < this.trail.length; i++) {
        fill(this.trail[i].hue, 100, 100);
        noStroke();
        ellipse(this.trail[i].x, this.trail[i].y, this.radius * 2, this.radius * 2);
    }
}

displayDotsTrail() {
    for (let i = 0; i < this.trail.length; i += 5) { // Render every 5th position for a dotted trail
        fill(this.trail[i].hue, 100, 100);
        noStroke();
        ellipse(this.trail[i].x, this.trail[i].y, this.radius * 2, this.radius * 2);
    }
}

displayFadingTrail() {
    for (let i = 0; i < this.trail.length; i++) {
        let fade = lerp(0, 100, i / this.trail.length);
        fill(this.trail[i].hue, 100, fade);
        noStroke();
        ellipse(this.trail[i].x, this.trail[i].y, this.radius * 2, this.radius * 2);
    }
}

displaySpiralTrail() {
    for (let i = 0; i < this.trail.length; i++) {
        const angle = i * 0.50; // Angle increment per trail element
        const spiralSize = 0.15; // Smaller multiplier to reduce the size of the spiral
        fill(this.trail[i].hue, 100, 100);
        noStroke();
        ellipse(
            this.trail[i].x + cos(angle) * i * spiralSize, 
            this.trail[i].y + sin(angle) * i * spiralSize, 
            this.radius * 2, this.radius * 2
        );
    }
}


displayWaveTrail() {
    for (let i = 0; i < this.trail.length; i++) {
        fill(this.trail[i].hue, 100, 100);
        noStroke();
        ellipse(this.trail[i].x, this.trail[i].y + sin(i * 0.1) * 20, this.radius * 2, this.radius * 2);
    }
}

displayRandomDotsTrail() {
    for (let i = 0; i < this.trail.length; i++) {
        if (random() < 0.1) { // Randomly choose whether to draw a dot
            fill(this.trail[i].hue, 100, 100);
            noStroke();
            ellipse(this.trail[i].x, this.trail[i].y, this.radius * 2, this.radius * 2);
        }
    }
}

}

function playNote(note) {
  console.log(note)
  sampler.triggerAttackRelease(note, "1n");
}

let ball;
function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  colorMode(HSB, 360, 100, 100);
  frameRate(120);
  userStartAudio();
  sampler = new Tone.Sampler({
          "D3" : "sound.mp3", // Assign your audio file to a key
  });
  sampler.connect(Tone.Master)
  ball = new Ball(INITIAL_BALL_RADIUS, INITIAL_SPEED);
}

function draw() {
  background(0);
  let ringHue = frameCount % 360;

  strokeWeight(5);
  stroke(ringHue, 100, 100);
  noFill();
  ellipse(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, RING_DIAMETER, RING_DIAMETER);

  ball.update();
  ball.display();
}