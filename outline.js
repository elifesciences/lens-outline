"use strict";

var View = require("substance-application").View;

// Lens.Outline
// ==========================================================================
// 
// Takes a surface, which is projected to a minimap

var Outline = function(surface) {
  View.call(this);

  this.surface = surface;

  // Initial view state, telling which node is selected and which are highlighted
  this.state = {
    selectedNode: null,
    highlightedNodes: []
  };

  this.$el.addClass('lens-outline');

  _.bindAll(this, 'mouseDown', 'mouseUp', 'mouseMove', 'updateVisibleArea');

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

  this.render = function() {
    var that = this;
    var totalHeight = 0;

    this.$el.empty();
    this.$el.append('<div class="visible-area"></div>');

    // Initial Calculations
    // --------

    var contentHeight = this.surface.$('.nodes').height();
    var panelHeight = this.surface.$el.height();

    var factor = (contentHeight / panelHeight);
    this.factor = factor;

    // Render nodes
    // --------

    var nodes = this.surface.doc.getNodes();

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

    // Wait for the DOM then draw visible area
    _.delay(this.updateVisibleArea.bind(this, scrollTop), 1);

    return this;
  };


  // Update visible area
  // -------------
  // 
  // Should get called from the user when the content area is scrolled

  this.updateVisibleArea = function(scrollTop) {
    this.$('.visible-area').css({
      "top": scrollTop / this.factor,
      "height": this.surface.$el.height() / this.factor
    });
  };


  // Update Outline
  // -------------
  // 
  // Usage:
  // 
  // outline.update({
  //   selectedNode: "node_14",
  //   highlightNodes: []
  // })

  this.update = function(state) {
    this.state = state;

    // Reset
    this.$('.node').removeClass('selected').removeClass('highlighted');
    this.$el.removeClass('figures').removeClass('citations');

    // Set context
    this.$el.addClass(state.context);

    // Mark selected node
    this.$('#outline_' + state.selectedNode).addClass('selected');

    // 2. Mark highlighted nodes
    _.each(state.highlightedNodes, function(n) {
      this.$('#outline_'+n).addClass('highlighted');
    }, this);
  };


  // Handle Mouse down event
  // -----------------
  // 

  this.mouseDown = function(e) {
    this._mouseDown = true;
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
    this._mouseDown = false;
  },

  // Handle Scroll
  // -----------------
  // 
  // Handle scroll event
  // .visible-area handle

  this.mouseMove = function(e) {
    if (this._mouseDown) {
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
