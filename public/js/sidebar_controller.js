function SidebarController(MAP_CONTROLLER){
  MAP = MAP_CONTROLLER;

  OSM_LINK = $('#base_control_osm');
  OSM_LINK_ICON = $('#base_control_icon_osm');

  BING_LINK = $('#base_control_bing');
  BING_LINK_ICON = $('#base_control_icon_bing');

  GOOGLE_LINK = $('#base_control_google');
  GOOGLE_LINK_ICON = $('#base_control_icon_google');

  this.initialize = function(){
    OSM_LINK.click(toggleOSMBase);
    BING_LINK.click(toggleBingBase);
    GOOGLE_LINK.click(toggleGoogleBase);
    //pre-loaded data
    this.addPolylineSubLink('mrt_network','MRT Network',false,'fa-train');
  }

  function toggleGoogleBase() {
    if (GOOGLE_LINK_ICON.hasClass('base_control_google_icon_selected')) {   //switch off OSM
      GOOGLE_LINK_ICON.removeClass('base_control_google_icon_selected');
      GOOGLE_LINK.removeClass('selected');
      MAP.hideGoogleBasemap();
    } else {        //switch on OSM
      GOOGLE_LINK_ICON.addClass('base_control_google_icon_selected');
      GOOGLE_LINK.addClass('selected');

      BING_LINK_ICON.removeClass('base_control_bing_icon_selected');
      BING_LINK_ICON.addClass('base_control_bing_icon');
      BING_LINK.removeClass('selected');
      OSM_LINK_ICON.removeClass('base_control_osm_icon_selected');
      OSM_LINK.removeClass('selected');

      MAP.hideBingBasemap();
      MAP.hideOSMBasemap();
      MAP.showGoogleBasemap();
    }
  }

  function toggleOSMBase(){
    if (OSM_LINK_ICON.hasClass('base_control_osm_icon_selected')) {   //switch off OSM
      OSM_LINK_ICON.removeClass('base_control_osm_icon_selected');
      OSM_LINK.removeClass('selected');
      MAP.hideOSMBasemap();
    } else {        //switch on OSM
      OSM_LINK_ICON.addClass('base_control_osm_icon_selected');
      OSM_LINK.addClass('selected');

      BING_LINK_ICON.removeClass('base_control_bing_icon_selected');
      BING_LINK_ICON.addClass('base_control_bing_icon');
      BING_LINK.removeClass('selected');
      GOOGLE_LINK_ICON.removeClass('base_control_google_icon_selected');
      GOOGLE_LINK.removeClass('selected');

      MAP.hideGoogleBasemap();
      MAP.hideBingBasemap();
      MAP.showOSMBasemap();
    }
  }

  function toggleBingBase(){
    if (BING_LINK_ICON.hasClass('base_control_bing_icon_selected')) {
      BING_LINK_ICON.removeClass('base_control_bing_icon_selected');
      BING_LINK_ICON.addClass('base_control_bing_icon');
      BING_LINK.removeClass('selected');
      MAP.hideBingBasemap();
    } else { //switch on bing
      BING_LINK_ICON.addClass('base_control_bing_icon_selected');
      BING_LINK_ICON.removeClass('base_control_bing_icon');
      BING_LINK.addClass('selected');

      OSM_LINK_ICON.removeClass('base_control_osm_icon_selected');
      OSM_LINK.removeClass('selected');
      GOOGLE_LINK_ICON.removeClass('base_control_google_icon_selected');
      GOOGLE_LINK.removeClass('selected');

      MAP.hideGoogleBasemap();
      MAP.hideOSMBasemap();
      MAP.showBingBasemap();
    }
  }
/**
 USERUPLOADS_MASTER_LINK = $('#super_link_useruploads');
  USERUPLOADS_MASTER_LINK.click(toggleUserUploads);

  USERUPLOADS_GROUP = $('#useruploads_layer_group');
  USERUPLOADS_LINKS = {};
**/
  POLYLINE_MASTER_LINK = $('#super_link_polyline');
  POLYLINE_MASTER_LINK.click(toggleSuperPolyline);

  POLYLINE_GROUP = $('#polyline_layer_group');
  POLYLINE_LINKS = {};

  POINTLAYER_MASTER_LINK = $('#super_link_point');
  POINTLAYER_MASTER_LINK.click(toggleSuperPointGroup);

  POINTLAYER_GROUP = $('#point_layer_group');
  POINTLAYER_LINKS = {};

  PROPORTIONAL_MASTER_LINK = $('#super_link_proportional');
  PROPORTIONAL_MASTER_LINK.click(toggleSuperProportionalGroup);

  PROPORTIONAL_GROUP = $('#proportional_layer_group');
  PROPORTIONAL_LINKS = {};

  CHOROPLETH_MASTER_LINK = $('#super_link_choropleth');
  CHOROPLETH_MASTER_LINK.click(toggleSuperChoroplethGroup);

  CHOROPLETH_GROUP = $('#choropleth_layer_group');
  CHOROPLETH_LINKS = {};

  function deactivateSublinks(links,className){
    var keys = Object.keys(links);
    for (var i in keys) {
      links[keys[i]]["link"].removeClass(className);
    }
  }

  function reinstateSublinks(links,className){
    var keys = Object.keys(links);
    for (var i in keys) {
      if (links[keys[i]]["active"]) {
        links[keys[i]]["link"].addClass(className);
      }
    }
  }

  function toggleSuperChoroplethGroup(){
    if (CHOROPLETH_MASTER_LINK.hasClass('choroplethlayer_selected')) {
      MAP.CHLOROPETH_CONTROLLER.hideAll();
      deactivateSublinks(CHOROPLETH_LINKS,'choroplethlayer_selected');
      CHOROPLETH_MASTER_LINK.removeClass('choroplethlayer_selected');
      $('#region_legend').css('visibility','hidden');
    } else {
      MAP.CHLOROPETH_CONTROLLER.showAll();
      reinstateSublinks(CHOROPLETH_LINKS,'choroplethlayer_selected');
      CHOROPLETH_MASTER_LINK.addClass('choroplethlayer_selected');
      $('#region_legend').css('visibility','visible');
    }
  }

  function toggleSuperPolyline(){
    if (POLYLINE_MASTER_LINK.hasClass('polyline_selected')) {
      MAP.POLYLINE_CONTROLLER.hideAll();
      deactivateSublinks(POLYLINE_LINKS,'polyline_selected');
      POLYLINE_MASTER_LINK.removeClass('polyline_selected');
    } else {
      MAP.POLYLINE_CONTROLLER.showAll();
      reinstateSublinks(POLYLINE_LINKS,'polyline_selected');
      POLYLINE_MASTER_LINK.addClass('polyline_selected');
    }
  }

  function toggleSuperPointGroup(){
    if (POINTLAYER_MASTER_LINK.hasClass('pointlayer_selected')) {
      MAP.POINT_CONTROLLER.hideAll();
      deactivateSublinks(POINTLAYER_LINKS,'pointlayer_selected');
      POINTLAYER_MASTER_LINK.removeClass('pointlayer_selected');
    } else {
      MAP.POINT_CONTROLLER.showAll();
      reinstateSublinks(POINTLAYER_LINKS,'pointlayer_selected');
      POINTLAYER_MASTER_LINK.addClass('pointlayer_selected');
    }
  }

  function toggleSuperProportionalGroup(){
    if (PROPORTIONAL_MASTER_LINK.hasClass('proportionallayer_selected')) {
      MAP.PROPORTIONAL_CONTROLLER.hideAll();
      deactivateSublinks(PROPORTIONAL_LINKS,'proportionallayer_selected');
      PROPORTIONAL_MASTER_LINK.removeClass('proportionallayer_selected');
      $('#legend').css('visibility','hidden');
    } else {
      MAP.PROPORTIONAL_CONTROLLER.showAll();
      reinstateSublinks(PROPORTIONAL_LINKS,'proportionallayer_selected');
      PROPORTIONAL_MASTER_LINK.addClass('proportionallayer_selected');
      $('#legend').css('visibility','visible');
    }
  }

  this.addChoroplethLayerSublink = function(id,textValue,faIcon,faIconColor){
    var new_link = addSubgroupLink(CHOROPLETH_GROUP,id,textValue,false,faIcon,undefined,undefined,faIconColor);
    new_link.addClass('choroplethlayer_selected');
    new_link.click(function(e){
      if (new_link.hasClass('choroplethlayer_selected')) {
        MAP.CHLOROPETH_CONTROLLER.hide(id);
        CHOROPLETH_LINKS[id]["active"] = false;
        new_link.removeClass('choroplethlayer_selected');
      } else {
        MAP.CHLOROPETH_CONTROLLER.show(id);
        CHOROPLETH_LINKS[id]["active"] = true;
        new_link.addClass('choroplethlayer_selected');
      }
    });
    CHOROPLETH_LINKS[id] = {"link":new_link,"active":true};
  }


    this.addUserLayerSublink = function(id,textValue,faIcon,faIconColor){
    var new_link = addSubgroupLink(USERUPLOADS_GROUP,id,textValue,false,faIcon,undefined,undefined,faIconColor);
    new_link.addClass('userlayer_selected');
    new_link.click(function(e){
      if (new_link.hasClass('userlayer_selected')) {
        MAP.USERUPLOAD_CONTROLLER.hide(id);
        USERUPLOAD_LINKS[id]["active"] = false;
        new_link.removeClass('userlayer_selected');
      } else {
        MAP.USERUPLOAD_CONTROLLER.show(id);
        USERUPLOAD_LINKS[id]["active"] = true;
        new_link.addClass('userlayer_selected');
      }
    });
    USERUPLOAD_LINKS[id] = {"link":new_link,"active":true};
  }

  this.addProportionalLayerSubLink = function(id,textValue,faIcon,faIconColor){
    var new_link = addSubgroupLink(PROPORTIONAL_GROUP,id,textValue,false,faIcon,undefined,undefined,faIconColor);
    new_link.addClass('proportionallayer_selected');
    new_link.click(function(e){
      if (new_link.hasClass('proportionallayer_selected')) {
        MAP.PROPORTIONAL_CONTROLLER.hide(id);
        PROPORTIONAL_LINKS[id]["active"] = false;
        new_link.removeClass('proportionallayer_selected');
      } else {
        MAP.PROPORTIONAL_CONTROLLER.show(id);
        PROPORTIONAL_LINKS[id]["active"] = true;
        new_link.addClass('proportionallayer_selected');
      }
    });
    PROPORTIONAL_LINKS[id] = {"link":new_link,"active":true};
  }

  this.addPointlayerSubLink = function(id,textValue,isCustomIcon,faIcon,customIconLink,customIconColor){
    var new_link = addSubgroupLink(POINTLAYER_GROUP,id,textValue,isCustomIcon,faIcon,customIconLink,customIconColor);
    new_link.addClass('pointlayer_selected');
    new_link.click(function(e){
      if (new_link.hasClass('pointlayer_selected')) {
        MAP.POINT_CONTROLLER.hide(id);
        POINTLAYER_LINKS[id]["active"] = false;
        new_link.removeClass('pointlayer_selected');
      } else {
        MAP.POINT_CONTROLLER.show(id);
        POINTLAYER_LINKS[id]["active"] = true;
        new_link.addClass('pointlayer_selected');
      }
    });
    POINTLAYER_LINKS[id] = {"link":new_link,"active":true};
  }
  
  this.addPolylineSubLink = function(id,textValue,isCustomIcon,faIcon){
    var new_link = addSubgroupLink(POLYLINE_GROUP,id,textValue,isCustomIcon,faIcon);
    new_link.addClass('polyline_selected');
    new_link.click(function(e){
      if (new_link.hasClass('polyline_selected')) {
        MAP.POLYLINE_CONTROLLER.hide(id);
        POLYLINE_LINKS[id]["active"] = false;
        new_link.removeClass('polyline_selected');
      } else {
        MAP.POLYLINE_CONTROLLER.show(id);
        POLYLINE_LINKS[id]["active"] = true;
        new_link.addClass('polyline_selected');
      }
    });
    POLYLINE_LINKS[id] = {"link":new_link,"active":true};
  }
//tackle the custom color and positioning on dashboard
  function addSubgroupLink(parent_list_group,id,textValue,isCustomIcon,faIcon,customIconLink,customIconColor,faIconColor){
    var icon = $('<i></i>');
    if (isCustomIcon) {
      icon
      .css({
        "background": "transparent url("+customIconLink+")",
        "overflow": "auto",
        "width": "22px",
        "height": "22px",
        "background-color": customIconColor,
        "left": "10px",
        "position": "absolute",
        "background-size": "cover"
      });
    } else {
      icon
      .attr({
        class: "fa " + faIcon
      });
      if (faIconColor) { icon.css({
        "color": faIconColor,
        "width": "22px",
        "height": "22px",
        "border-radius": "11px",
        "position":"absolute",
        "left": "10px"
      }); }
    }

    var new_link = $('<a></a>')
      .attr({
        id: id,
        href: "#"
      })
      .text(textValue);
    new_link.append(icon);
    parent_list_group.append($('<p></p>').append(new_link));
    return new_link;
  }

  this.emptyAllSublinks = function(){
    POINTLAYER_GROUP.empty();
    POINTLAYER_LINKS = {};
  }
}

var SIDEBAR = new SidebarController(MAP);
SIDEBAR.initialize();
MAP.setSidebar(SIDEBAR);