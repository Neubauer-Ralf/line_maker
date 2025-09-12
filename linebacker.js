let x_displace_slider, y_displace_slider, n_dots_slider, n_lines_slider, 
    coupling_slider, space_width_slider, max_spaces_slider;

let n_lines = 10;
let n_dots = 70;
let y_padding = 20;
let y_start = 185;
let x_padding = 10;

function setup() {
  createCanvas(windowWidth, 600);
  
  // Sliders let us explore how each parameter changes the drawing interactively
  x_displace_slider = createSlider(1, 100, 1);
  y_displace_slider = createSlider(1, 100, 4);
  n_dots_slider = createSlider(20, 200, n_dots);
  n_lines_slider = createSlider(2, 100, n_lines);
  max_spaces_slider = createSlider(3, 20, 5);
  coupling_slider = createSlider(0, 100, 0);
  space_width_slider = createSlider(1, 10, 2);

  // Place sliders in a vertical stack centered at the top
  let sliderY = 20;
  for (let s of [
    x_displace_slider, y_displace_slider, n_dots_slider, 
    n_lines_slider, coupling_slider, max_spaces_slider, space_width_slider
  ]) {
    s.position(width / 2 - s.width / 2, sliderY);
    s.input(redraw); // Only redraw when sliders move
    sliderY += 20;
  }

  strokeWeight(2);
}

function draw() {
  smooth();
  clear();
  fill(0);

  // Labels help us remember what each slider controls
  text('x shift', x_displace_slider.x + x_displace_slider.width + 10, 35);
  text('y shift', y_displace_slider.x + y_displace_slider.width + 10, 55);
  text('num dots', n_dots_slider.x + n_dots_slider.width + 10, 75);
  text('num lines', n_lines_slider.x + n_lines_slider.width + 10, 95);
  text('coupling', coupling_slider.x + coupling_slider.width + 10, 115);
  text('max spaces', max_spaces_slider.x + max_spaces_slider.width + 10, 135);
  text('space width', space_width_slider.x + space_width_slider.width + 10, 155);
  noFill();

  // Read slider values – this lets us experiment without touching the code
  let x_displacement = x_displace_slider.value() / 3;
  let y_displacement = y_displace_slider.value() / 3;
  let n_dots = n_dots_slider.value();
  let n_lines = n_lines_slider.value();
  let coupling = coupling_slider.value() / 100;
  let max_spaces = max_spaces_slider.value();
  let space_width = space_width_slider.value();

  noLoop(); // Don’t animate continuously – only when parameters change

  let padded_width = width - 2 * x_padding;
  let padded_height = height - 2 * y_padding - y_start;

  for (let i = 0; i < n_lines; i++) {
    let y = y_start + y_padding + i * padded_height / (n_lines - 1);

    // Decide how many "words" (segments of connected dots) this line has
    let num_words = floor(random(2, max_spaces));

    // Randomly assign relative lengths to each segment
    let segment_lengths = [];
    let total = 0;
    segment_lengths[0] = 0; // first always starts at 0
    for (let k = 1; k <= num_words; k++) {
      segment_lengths[k] = random(0, 1);
      total += segment_lengths[k];
    }

    // Normalize segment lengths so they fill the available dots
    for (let k = 1; k <= num_words; k++) {
      segment_lengths[k] *= (n_dots - 1 - space_width * (num_words - 1)) / total;
    }

    // Convert segment lengths into actual start/end positions on the dot grid
    let starts = [];
    let ends = [];
    let rem = 0;
    let current = 0;
    starts[0] = 0;
    ends[num_words - 1] = n_dots;

    for (let k = 0; k <= num_words; k++) {
      let new_rem = (segment_lengths[k] + rem) % 1;
      segment_lengths[k] = current + round(segment_lengths[k] + rem);

      if (k > 0) {
        ends[k - 1] = segment_lengths[k];
        current = segment_lengths[k] + space_width;
      }
      starts[k] = current;
      rem = new_rem - round(new_rem); // carry rounding error forward
    }

    let word_number = 0;
    let skip_counter = 1;

    // Build curve through dots, skipping spaces where needed
    beginShape();
    for (let j = 0; j < n_dots; j++) {
      if (j == ends[word_number]) {
        word_number++;
        skip_counter = 2 + space_width; // pause before starting next segment
      }

      let x = x_padding + j * padded_width / (n_dots - 1);

      // Random jitter to make the lines look organic instead of mechanical
      let x_delta = random(-x_displacement, x_displacement);
      let y_delta = (1 - coupling) * random(-y_displacement, y_displacement);
      y_delta -= coupling * x_delta * y_displacement / x_displacement;

      if (skip_counter == 2 + space_width) {
        // Close off the word smoothly
        curveVertex(x + x_delta, y + y_delta);
        curveVertex(x + x_delta, y + y_delta);
        endShape();
        skip_counter--;
      } else if (skip_counter < 2 * space_width && skip_counter > 1) {
        // Inside a gap – skip dots
        skip_counter--;
      } else if (skip_counter == 1) {
        // Begin new word here
        beginShape();
        curveVertex(x + x_delta, y + y_delta);
        curveVertex(x + x_delta, y + y_delta);
        skip_counter--;
      } else {
        // Continue drawing inside a word
        curveVertex(x + x_delta, y + y_delta);
      }
    }
  }
}
