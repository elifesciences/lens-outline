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
  // initialized on first update
  this.$nodes = null;

  this.$el.addClass('lens-outline');
  this.$el.addClass(surface.docCtrl.getContainer().id);

  this.overlays = [];

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
    var contentHeight = this.surface.$('.nodes').height();
    var panelHeight = this.surface.$el.height();
    this.factor = (contentHeight / panelHeight);
    this.visibleArea = $$('.visible-area');

    // Init scroll pos
    var scrollTop = this.surface.$el.scrollTop();
    this.el.innerHTML = "";
    this.el.appendChild(this.visibleArea);
    this.updateVisibleArea(scrollTop);
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

  this.addOverlay = function(el, surfaceTop) {
    var $el = $(el);
    var height = $el.outerHeight(true) / this.factor;
    var top = ($el.offset().top - surfaceTop) / this.factor;
    // HACK: make all highlights at least 3 pxls high, and centered around the desired top pos
    if (height < 3) {
      height = 3;
      top = top - 1.5 + 0.5*height;
    }
    var $overlay = $('<div>')
      .addClass('node overlay')
      .css({
        "height": height,
        "top": top
      });
    this.overlays.push($overlay[0]);
    this.$el.append($overlay);
    return $overlay;
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

  this.update = function(options) {
    options = options || {};

    // initialized lazily as this element is not accessible earlier (e.g. during construction)
    if (!this.$nodes) this.$nodes = this.surface.$('.nodes');

    var scrollTop = this.surface.$el.scrollTop();
    this.updateVisibleArea(scrollTop);


    // get the new dimensions
    var contentHeight = this.$nodes.height();
    var panelHeight = this.surface.$el.height();
    var surfaceTop = this.$nodes.offset().top;
    this.factor = (contentHeight / panelHeight);

    // remove previous overlays
    $(this.overlays).remove();
    this.overlays = [];

    // set the highlight class which controls the color if the overlays.
    this.el.dataset.highlightClass = options.highlightClass;

    if (options.selectedNode && options.selectedNode !== "all") {
      var selectedNode = this.surface.findNodeView(options.selectedNode);
      if (selectedNode) {
        this.addOverlay(selectedNode, surfaceTop);
      } else {
        console.error("Could not find 'selectedNode'", options.selectedNode);
      }
    }
    // Mark highlighted nodes
    _.each(options.highlightedNodes, function(nodeId) {
      if (!nodeId) return;
      var highlightedNode = this.surface.findNodeView(nodeId);
      if (highlightedNode) {
        this.addOverlay(highlightedNode, surfaceTop);
      } else {
        console.error("Could not find 'highlightedNode'", nodeId);
      }
    }, this);

    // Mark key nodes
    _.each(options.keyNodes, function(nodeId) {
      if (!nodeId) return;
      var keyNode = this.surface.findNodeView(nodeId);
      if (keyNode) {
        var $el = this.addOverlay(keyNode, surfaceTop);
        $el.addClass('key-node');
      } else {
        console.error("Could not find 'highlightedNode'", nodeId);
      }
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
      var scroll = (y-this.offset)*this.factor;
      this.surface.$el.scrollTop(scroll);
      this.updateVisibleArea(scroll);
    }
  };

  this.onScroll = function() {
    if (this.surface) {
      var scrollTop = this.surface.$el.scrollTop();
      this.updateVisibleArea(scrollTop);
    }
  };

};

Outline.Prototype.prototype = View.prototype;
Outline.prototype = new Outline.Prototype();

module.exports = Outline;
