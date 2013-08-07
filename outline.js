"use strict";

var View = require("substance-application").View;

// Lens.Outline
// ==========================================================================
// 
// Takes a surface, which is projected to a minimap

var Outline = function(surface, options) {
  View.call(this);

  this.surface = surface;
  this.$el.addClass('lens-outline');

  _.bindAll(this, 'mouseDown', 'mouseUp', 'mouseMove');

  // Mouse event handlers
  // --------

  this.$el.mousedown(this.mouseDown);
  this.$el.mousemove(this.mouseMove);
  this.$el.mouseup(this.mouseUp);
};

Outline.Prototype = function() {
  
  // Render Document Outline
  // -------------
  // 
  // Renders outline and calculates bounds
  // Used for auto-selecting current heading

  this.render = function() {
    var that = this;
    var totalHeight = 0;

    // TODO: rather use recalibrate workflow
    this.$el.empty();
    this.$el.append('<div class="visible-area"></div>');

    // Initial Calculations
    // --------

    var contentHeight = this.surface.$('.nodes').height();
    var panelHeight = this.surface.$el.height(); // this.$el.height();

    var factor = (contentHeight / panelHeight);
    this.factor = factor;


    // Render nodes
    // --------

    var nodes = this.surface.writer.getNodes();

    _.each(nodes, function(node) {
      var dn = this.surface.$('#'+node.id);
      var height = dn.outerHeight(true) / factor;
        
      // Outline node construction
      var $node = $('<div class="node">')
        .attr({
          id: 'outline_'+node.id,
        })
        .addClass(node.type)
        .css({
          "position": "absolute",
          "height": height-1,
          "top": totalHeight
        }).append('<div class="arrow">');

      this.$el.append($node);
      totalHeight += height;
    }, this);

    // Init scroll pos
    var scrollTop = that.surface.$el.scrollTop();

    this.$('.visible-area').css({
      "top": scrollTop / factor,
      "height": panelHeight / factor
    });
    
    // Listen for scroll changes update outline scroll pos accordingly
    // --------
    // 

    this.surface.$el.unbind('scroll');
    this.surface.$el.scroll(function() {
      var scrollTop = that.surface.$el.scrollTop();

      // Update visible area
      that.$('.visible-area').css({
        "top": scrollTop / factor,
        "height": that.$el.height() / factor
      });
      //   that.markActiveHeading();
    });

    return this;
  };


  // Adjust
  // -------------
  // 
  // Recalibrate (.e.g after resize)

  // thais.adjust = function() {

  //   // Current scrolltop
  //   var scrollTop = that.surface.$el.scrollTop();

  //   // Update visible area
  //   that.$('.visible-area').css({
  //     "top": scrollTop / factor,
  //     "height": that.$el.height() / factor
  //   });
  //     //   that.markActiveHeading();
  // };

  this.setActiveNode = function() {
    console.log('Setting active node...');
  };

  // Update Outline
  // -------------
  // 

  this.update = function() {
    var that = this;
    // var doc = this.model.document;

    // Reset
    this.$('.node').removeClass('active').removeClass('highlighted');
    that.$el.removeClass('figure').removeClass('citation');

    // 1. Mark active node
    // if (this.model.node) {
    //   this.$('#outline_'+_.htmlId(this.model.node)).addClass('active');  
    // }

    if (this.model.resource) {
      that.$('.outline').addClass(this.model.resourceType);

      var annotations = doc.find('reverse_annotations', this.model.resource);
      _.each(annotations, function(a) {
        var node = a.source;
        that.$('#outline_'+_.htmlId(node)).addClass('highlighted');
      });
    }
  };


  // Handle Mouse down event
  // -----------------
  // 

  this.mouseDown = function(e) {
    this.mouseDown = true;
    var y = e.pageY;

    // Find offset to visible-area.top
    this.offset = y - $('.visible-area').position().top;
    return false;
  };

  // Handle Mouse Up
  // -----------------
  // 
  // Mouse lifted, no scroll anymore

  this.mouseUp = function() {
    this.mouseDown = false;
  },

  // Handle Scroll
  // -----------------
  // 
  // Handle scroll event
  // .visible-area handle

  this.mouseMove = function(e) {
    if (this.mouseDown) {
      var y = e.pageY;
      // find offset to visible-area.top
      var scroll = (y - this.offset)*this.factor;
      this.surface.$el.scrollTop(scroll);
    }
  };

};

Outline.Prototype.prototype = View.prototype;
Outline.prototype = new Outline.Prototype();

module.exports = Outline;
