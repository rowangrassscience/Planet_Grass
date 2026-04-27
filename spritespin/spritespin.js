(function(global, $){

  function SpriteSpin(opts){
    this.opts = opts;
    this.$target = opts.target;
    this.frames = opts.source || [];
    this.frame = 0;
    this.zoom = 1;
    this.dragging = false;
    this.lastX = 0;
    this.images = [];
    this.firstLoaded = false;
    this.init();
  }

  SpriteSpin.prototype.init = function(){
    var self = this;

    // Create canvas
    self.canvas = document.createElement("canvas");
    self.ctx = self.canvas.getContext("2d");
    self.$target.append(self.canvas);

    // Resize
    function resize(){
      self.canvas.width = self.$target.width();
      self.canvas.height = self.$target.height();

      // IMPORTANT FIX: do NOT draw until first image is loaded
      if (self.firstLoaded) {
        self.draw();
      }
    }
    $(window).on("resize", resize);
    resize();

    // Load frames
    self.frames.forEach(function(src, i){
      var img = new Image();
      img.onload = function(){
        self.images[i] = img;

        // When the first frame loads, mark ready and draw
        if (i === 0) {
          self.firstLoaded = true;
          self.draw();
        }
      };
      img.src = src;
    });

    // Drag
    self.$target.on("mousedown touchstart", function(e){
      self.dragging = true;
      self.lastX = e.pageX || e.originalEvent.touches[0].pageX;
    });

    $(window).on("mouseup touchend", function(){
      self.dragging = false;
    });

    self.$target.on("mousemove touchmove", function(e){
      if(!self.dragging || !self.firstLoaded) return;
      var x = e.pageX || e.originalEvent.touches[0].pageX;
      var dx = x - self.lastX;
      self.lastX = x;
      self.frame = (self.frame + Math.sign(dx) + self.frames.length) % self.frames.length;
      self.draw();
    });

    // Zoom
    self.$target.on("wheel", function(e){
      if (!self.firstLoaded) return;
      e.preventDefault();
      self.zoom += (e.originalEvent.deltaY < 0 ? 0.1 : -0.1);
      self.zoom = Math.max(self.opts.zoomMin || 1, Math.min(self.opts.zoomMax || 3, self.zoom));
      self.draw();
    });
  };

  SpriteSpin.prototype.draw = function(){
    var img = this.images[this.frame];

    // IMPORTANT FIX: prevent drawing before image exists
    if (!img) return;

    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;

    ctx.clearRect(0,0,w,h);

    var scale = this.zoom;
    var iw = img.width * scale;
    var ih = img.height * scale;

    ctx.drawImage(img, (w - iw)/2, (h - ih)/2, iw, ih);
  };

  SpriteSpin.create = function(opts){
    return new SpriteSpin(opts);
  };

  global.SpriteSpin = SpriteSpin;

})(window, jQuery);
