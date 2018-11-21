define(["esri/layers/GraphicsLayer","esri/layers/FeatureLayer","esri/symbols/TextSymbol","esri/layers/support/LabelClass","esri/tasks/support/Query","esri/Graphic","esri/geometry/support/webMercatorUtils","dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/on","require"],function(e,t,s,i,r,a,o,l,h,n,u,p){var c={type:"simple",symbol:{type:"simple-marker",style:"circle",size:10,color:[255,255,255,.6],outline:{width:1.5,color:"red",style:"solid"}},visualVariables:[{type:"size",field:"point_count",minDataValue:3,maxDataValue:1e3,minSize:{type:"size",valueExpression:"$view.scale",stops:[{value:1128,size:"20px"},{value:591657528,size:"12px"}]},maxSize:{type:"size",valueExpression:"$view.scale",stops:[{value:1128,size:"60px"},{value:288895,size:"50px"},{value:73957191,size:"40px"},{value:591657528,size:"12px"}]}}]},d=[{name:"objectid",alias:"Cluster ID in Local Index",type:"oid"},{name:"cluster_id",alias:"Cluster ID in Local Index",type:"long"},{name:"point_count",alias:"Total Points in Cluster Recorded",type:"long"},{name:"point_count_abbreviated",alias:"Total Points in Cluster (abbreviated)",type:"string"}],b={title:"Cluster Info",content:[{type:"fields",fieldInfos:[{fieldName:"cluster_id",label:"Cluster ID in Local Index",visible:!0},{fieldName:"point_count",label:"Total Points in Cluster",visible:!0},{fieldName:"point_count_abbreviated",label:"Total Points in Cluster (abbreviated)",visible:!0}]}]},y={type:"text",color:"black",haloColor:"blue",haloSize:"40px",text:"",xoffset:0,yoffset:"-4px",font:{size:"12px",family:"sans-serif",weight:"bolder"}},f=[new i({labelExpressionInfo:{expression:"$feature.point_count_abbreviated"},labelPlacement:"center-center",symbol:{type:"text",color:"black",font:{size:9,family:"sans-serif",weight:"normal"}}})];return t.createSubclass({properties:{clusterIndexReady:{},source_definitionExpression:{}},constructor:function(e){for(var t in this.opts=e,this.featureLayerOpts={},this.worker=new Worker(p.toUrl("./ClusterWorker.js")),this.worker.onmessage=h.hitch(this,function(e){e.data.workerReady?this.worker.postMessage({supercluster:p.toUrl("./")+"../node_modules/supercluster/dist/supercluster.js"}):e.data.superclusterReady?(this.clusterWorkerReady=!0,this.view&&this.initClusterLayer()):e.data.indexReady?(this.clusterIndexReady=!0,this.requestClusters(!0)):this.displayClusters(e.data)}),this.opts){var s=this.opts[t];"source_url"==t?this.featureLayerOpts.url=s:"source_definitionExpression"==t?this.featureLayerOpts.definitionExpression=s:"source_outFields"==t?this.featureLayerOpts.outFields=s:"supercluster"!=t&&"source"!=t&&"popupTemplate"!=t&&"renderer"!=t&&(this.featureLayerOpts[t]=s)}this.opts.supercluster||(this.opts.supercluster={}),this.currentFeatures=[],this.currentClusters=[],this.view=null,this.allViews=[],this.clusterFieldNames=n.map(d,function(e){return e.name});var i=this.opts.supercluster.fields||[];return this.opts.fields=d.concat(n.filter(i,h.hitch(this,function(e){return-1==this.clusterFieldNames.indexOf(e.name)}))),this.opts.popupTemplate||(this.opts.popupTemplate=b),this.opts.labelWithGraphics&&(this.opts.labelsVisible=!1),this.opts.labelsVisible&&!this.opts.labelingInfo&&(this.opts.labelingInfo=f),this.opts.labelsVisible&&!this.opts.labelingInfo&&(this.opts.labelingInfo=f),this.opts.labelWithGraphics&&!this.opts.labelSymbol&&(this.opts.labelSymbol=y),!this.opts.labelsVisible&&!this.opts.labelWithGraphics||this.opts.labelField||(this.opts.labelField="point_count_abbreviated"),this.opts.renderer||(this.opts.renderer=c),this.opts.geometryType="point",this.opts.spatialReference={wkid:4326},this.opts.objectIdField="objectid",this.opts.source&&(this.opts.source_features=this.opts.source),this.opts.source=[],this.inherited(arguments)},createLayerView:function(t){return this.view||(this.view=t),this.allViews.push(t),this.opts.labelWithGraphics&&(this.labelGraphics=new e({graphics:[],popupTemplate:this.popupTemplate}),this.view.map.add(this.labelGraphics),this.labelGraphics.opacity=0),this.watchView(this.view),this.clusterWorkerReady&&this.initClusterLayer(),this.inherited(arguments)},destroyLayerView:function(e){return this.allViews.splice(this.allViews.indexOf(e),1),-1==this.allViews.indexOf(this.view)&&(this.allViews.length>0?this.view=this.allViews[0]:this.view=null),this.watchView(this.view),this.inherited(arguments)},watchView:function(e){this.stationaryWatch&&this.stationaryWatch.remove(),this.scaleWatch&&this.scaleWatch.remove(),e&&(this.stationaryWatch=this.view.watch("stationary",h.hitch(this,this.requestClusters)),this.scaleWatch=this.view.watch("scale",h.hitch(this,function(){this.labelGraphics&&(this.labelGraphics.opacity=0)})))},initClusterLayer:function(e){this.featureLayerOpts.url&&!this.featureLayerOpts.direct_url?(this.source_layer=new t(this.featureLayerOpts),this.source_layer.load().then(h.hitch(this,function(){this.source_definitionExpression=this.source_layer.definitionExpression,this.watch("source_definitionExpression",function(e,t){this.source_layer.definitionExpression=e,this.loadFeatures()}),this.loadFeatures()}),function(e){console.log("Error: ",e)})):this.loadFeatures()},loadFeatures:function(e,t){var s=h.mixin({},this.opts.supercluster);if(s.fields&&delete s.fields,this.clusterIndexReady||this.worker.postMessage({opts:s}),this.opts.source_features){if(this.currentFeatures.length>0)return;this.worker.postMessage({features:this.opts.source_features,type:"esri",load:!0})}else if(this.opts.source_url&&this.featureLayerOpts.direct_url){if(this.currentFeatures.length>0)return;this.worker.postMessage({url:this.opts.source_url,load:!0,type:this.featureLayerOpts.direct_type||"geojson"})}else{e=e||this.source_layer.definitionExpression||"1=1",0==(t=t||0)&&(this.currentFeatures=[]);var i=n.filter(this.source_layer.outFields,h.hitch(this,function(e){return-1==this.clusterFieldNames.indexOf(e)}));0==i.length&&(i=[this.source_layer.objectIdField]);var a=new r({num:this.source_layer.maxRecordCount||1e3,start:t,where:e,outFields:i,outSpatialReference:{wkid:4326},returnGeometry:!0}),o=h.hitch(this,function(e){this.worker.postMessage({features:e.features.map(m),type:"esri",load:!e.exceededTransferLimit}),e.exceededTransferLimit&&(a.start+=e.features.length,this.source_layer.queryFeatures(a).then(o))});this.source_layer.queryFeatures(a).then(o)}},requestClusters:function(e){if(this.view.popup.visible&&this.view.popup.selectedFeature&&(this.view.popup.selectedFeature.layer!=this&&this.view.popup.selectedFeature.layer!=this.labelGraphics||(this.view.popup.visible=!1)),e&&this.clusterIndexReady&&this.view){var t=parseInt(Math.round(this.view.zoom)),s=o.webMercatorToGeographic(t<5?this.view.map.basemap.baseLayers.items[0].fullExtent:this.view.extent);this.worker.postMessage({bbox:[s.xmin,s.ymin,s.xmax,s.ymax],zoom:t})}},displayClusters:function(e){this.labelGraphics&&this.labelGraphics.removeAll(),this.currentClusterOIDs&&this.applyEdits({deleteFeatures:this.currentClusterOIDs}),this.currentClusters=n.map(e,h.hitch(this,function(e){var t=function(e){try{return new a({geometry:{type:"point",longitude:e.geometry.coordinates[0],latitude:e.geometry.coordinates[1]},attributes:e.properties})}catch(e){console.log("Error converting GeoJSON to Graphic:",e)}}(e);return t.attributes.point_count_abbreviated&&(t.attributes.point_count_abbreviated=t.attributes.point_count_abbreviated.toString()),this.opts.labelFormatter&&(t.attributes[this.opts.labelField]=this.opts.labelFormatter(t.attributes[this.opts.labelField])||t.attributes[this.opts.labelField]),t})),this.applyEdits({addFeatures:this.currentClusters}).then(h.hitch(this,function(e){this.currentClusterOIDs=n.map(e.addFeatureResults,function(e){return{objectId:e.objectId}})}),h.hitch(this,function(e){this.source.removeAll(),this.source.addMany(this.currentClusters)})),this.labelGraphics&&(this.labelGraphics.addMany(n.map(n.filter(this.currentClusters,h.hitch(this,function(e){return e.attributes.point_count>0})),h.hitch(this,function(e){return new a({geometry:e.geometry,attributes:e.attributes,symbol:new s(h.mixin({},this.opts.labelSymbol,{text:e.attributes[this.opts.labelField]}))})}))),setTimeout(h.hitch(this,function(){this.labelGraphics.opacity=1}),this.has_loaded?200:500),this.has_loaded=!0)}});function m(e){return e.toJSON()}});
//# sourceMappingURL=ClusterLayer.js.map