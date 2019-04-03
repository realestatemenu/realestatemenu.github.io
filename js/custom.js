<script>
  //Home Page Graphic
  //Handles Window Resize
  $(window).on("resize", function () {
    resizeCanvas();
  });

  //adapted from https://bl.ocks.org/mbostock/3231307
  var width = d3.select("#cover").node().clientWidth,
      height = d3.select("#intro").node().clientHeight;;

  var nodes = d3.range(200).map(function() { return {radius: Math.random() * 20 + 2}; }),
      root = nodes[0],
      color = ['#673AB7', '#381A5B', '#793BC4', '#714E9E', '#D40D12', '#94090D', '#5C0002'];

  root.radius = 0;
  root.fixed = true;
  root.px = width/2;
  root.py = height/2;

  var force = d3.layout.force()
      .gravity(0.005)
      .charge(function(d, i) { return i ? 0 : -400; })
      .nodes(nodes)
      .size([width, height]);

  force.start();

  var canvas = d3.select("#cover").append("canvas")
      .attr("width", width)
      .attr("height", height);

  var context = canvas.node().getContext("2d");

  force.on("tick", function(e) {
    var q = d3.geom.quadtree(nodes),
        i,
        d,
        n = nodes.length;

    for (i = 1; i < n; ++i) q.visit(collide(nodes[i]));

    context.clearRect(0, 0, width, height);
    force.size([width, height]);
    for (i = 1; i < n; ++i) {
      context.fillStyle = color[i % color.length];
      d = nodes[i];
      context.moveTo(d.x, d.y);
      context.beginPath();
      context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
      context.fill();
    }
  });

  canvas.on("mousemove", function() {
    var p1 = d3.mouse(this);
    root.px = p1[0];
    root.py = p1[1];
    force.resume();
  });

  function collide(node) {
    var r = node.radius + 160,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;

    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== node)) {
        var x = node.x - quad.point.x,
            y = node.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = node.radius + quad.point.radius + 10;
        if (l < r) {
          l = (l - r) / l * .5;
          node.x -= x *= l;
          node.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
        //Prevent circles in center
        xCenter = node.x-width/2,
        yCenter = node.y-height/2,
        lCenter = Math.sqrt(xCenter * xCenter + yCenter * yCenter),
        rCenter = node.radius + 200;
        if (lCenter < rCenter) {
         lCenter = (lCenter - rCenter) / lCenter * .5;
          node.x -= xCenter *= lCenter;
          node.y -= yCenter *= lCenter;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }

  //Makes Canvas fit entire screen
  function resizeCanvas() {
    width = d3.select("#cover").node().clientWidth
    canvas.attr("width", width).attr("height", height);
    force.tick();
  }
</script> 