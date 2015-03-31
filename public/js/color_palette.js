function ColorPalette() {
  var colors = [
    'rgba(0, 172, 237, 1)',
    'rgba(59, 89, 152, 1)',
    'rgba(221, 75, 57, 1)',
    'rgba(203, 32, 39, 1)',
    'rgba(0, 123, 182, 1)',
    'rgba(187, 0, 0, 1)',
    'rgba(170, 212, 80, 1)',
    'rgba(50, 80, 109, 1)',
    'rgba(81, 127, 164, 1)',
    'rgba(255, 0, 132, 1)',
    'rgba(234, 76, 137, 1)',
    'rgba(168, 36, 0, 1)',
    'rgba(0, 114, 177, 1)',
    'rgba(91, 154, 104, 1)',
    'rgba(69, 102, 142, 1)',
    'rgba(33, 117, 155, 1)',
    'rgba(235, 72, 35, 1)',
    'rgba(123, 0, 153, 1)',
    'rgba(251, 143, 61, 1)',
    'rgba(255, 58, 0, 1)'
  ]

  this.randomColor = function(){
    return colors[Math.floor(Math.random() * (colors.length))];
  }
}

var COLORS = new ColorPalette();