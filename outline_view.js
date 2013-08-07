"use strict";

var View = require("substance-application").View;


// Lens.Outline.View
// ==========================================================================


var OutlineView = function(document) {
  View.call(this);

  this.$el.addClass('lens-outline');
};

OutlineView.Prototype = function() {
  

  // Render Document Outline
  // -------------
  // 
  // Renders outline and calculates heading bounds
  // Used for auto-selecting current heading

  this.render = function() {
    var that = this;
    var totalHeight = 0;
    var doc = this.model.document;

    that.$('.outline').empty();
    that.$('.outline').append('<div class="visible-area"></div>');

    var contentHeight = $('.nodes').height();
    var panelHeight = $('.outline').height();

    var factor = (contentHeight / panelHeight);
    this.factor = factor;

    _.each(doc.views.content, function(node) {
      var n = doc.nodes[node];
      var dn = $('#node_'+_.htmlId(n.id));

      var height = dn.outerHeight(true) / factor;
      
      var $node = '<div class="node '+n.type+'" id="outline_'+_.htmlId(node)+'" style="position: absolute; height: '+(height-1)+'px; top:'+totalHeight+'px;"><div class="arrow"></div></div>';
      that.$('.outline').append($node);
      totalHeight += height;
    });


    // Init scroll pos
    var scrollTop = $('#container .content').scrollTop();
    $('.visible-area').css({
      "top": scrollTop / factor,
      "height": $('#document .outline').height() / factor
    });

    $('#container .content').unbind('scroll');
    $('#container .content').scroll(function() {
      // update outline scroll pos
      var scrollTop = $('#container .content').scrollTop();

      // Update visible area
      $('.visible-area').css({
        "top": scrollTop / factor,
        "height": $('#document .outline').height() / factor
      });

      that.markActiveHeading();
    });
  };



  // Update Outline
  // -------------
  // 
  // Renders outline and calculates heading bounds
  // Used for auto-selecting current heading

  this.update = function() {
    var that = this;
    var doc = this.model.document;

    // Reset
    this.$('.outline .node').removeClass('active').removeClass('highlighted');
    that.$('.outline').removeClass('figure').removeClass('publication');

    // 1. Mark active node
    if (this.model.node) {
      this.$('#outline_'+_.htmlId(this.model.node)).addClass('active');  
    }

    if (this.model.resource) {
      that.$('.outline').addClass(this.model.resourceType);

      var annotations = doc.find('reverse_annotations', this.model.resource);
      _.each(annotations, function(a) {
        var node = a.source;
        that.$('#outline_'+_.htmlId(node)).addClass('highlighted');
      });
    }
  };


  // _mouseDown: function(e) {
  //   this.mouseDown = true;
  //   var y = e.pageY;

  //   // find offset to visible-area.top
  //   this.offset = y - $('.visible-area').position().top;
  //   return false;
  // },

  // // Handle Mouse Up
  // // -----------------
  // // 
  // // Mouse lifted, no scroll anymore

  // _mouseUp: function() {
  //   this.mouseDown = false;
  // },

  // // Handle Scroll
  // // -----------------
  // // 
  // // Handle scroll event
  // // .visible-area handle

  // _scroll: function(e) {
  //   if (this.mouseDown) {
  //     var y = e.pageY;
  //     // find offset to visible-area.top
  //     var scroll = (y - this.offset)*this.factor;
  //     $('#container .content').scrollTop(scroll);
  //   }
  // },

};

OutlineView.Prototype.prototype = View.prototype;
OutlineView.prototype = new OutlineView.Prototype();

module.exports = OutlineView;
