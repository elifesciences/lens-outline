"use strict";

var View = require("substance-application").View;
var $$ = require("substance-application").$$;
var _ = require("underscore");

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

  $(window).mousemove(this.mouseMove);
  $(window).mouseup(this.mouseUp);
};

Outline.Prototype = function() {

  // Render Document Outline
  // -------------
  //
  // Renders outline and calculates bounds

  this.render = function() {
    var that = this;
    var totalHeight = 0;

    var fragment = document.createDocumentFragment();
    this.visibleArea = $$('.visible-area');
    fragment.appendChild(this.visibleArea);


    // Initial Calculations
    // --------

    var contentHeight = this.surface.$('.nodes').height();
    var panelHeight = this.surface.$el.height();

    var factor = (contentHeight / panelHeight);
    this.factor = factor;

    // Render nodes
    // --------

    var container = this.surface.docCtrl.container;
    var nodes = container.getTopLevelNodes();

    _.each(nodes, function(node) {
      var $dn = $(this.surface.findNodeView(node.id));
      var height = $dn.outerHeight(true) / factor;

      // Outline node construction
      var $node = $('<div class="node">')
        .attr({
          id: 'outline_'+node.id,
        })
        .css({
          "position": "absolute",
          "height": height-1,
          "top": totalHeight
        })
        .addClass(node.type)
        .append('<div class="arrow">');
      fragment.appendChild($node[0]);
      totalHeight += height;
    }, this);

    // Init scroll pos
    var scrollTop = that.surface.$el.scrollTop();

    that.el.innerHTML = "";
    that.el.appendChild(fragment);
    that.updateVisibleArea(scrollTop);

    return this;
  };


  // Update visible area
  // -------------
  //
  // Should get called from the user when the content area is scrolled

  this.updateVisibleArea = function(scrollTop) {
    $(this.visibleArea).css({
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
    this.render();
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

    if (e.target !== this.visibleArea) {
      // Jump to mousedown position
      this.offset = $(this.visibleArea).height()/2;
      this.mouseMove(e);
    } else {
      this.offset = y - $(this.visibleArea).position().top;
    }

    return false;
  };

  // Handle Mouse Up
  // -----------------
  //
  // Mouse lifted, no scroll anymore

  this.mouseUp = function() {
    this._mouseDown = false;
  };

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
