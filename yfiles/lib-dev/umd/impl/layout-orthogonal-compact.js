/****************************************************************************
 ** @license
 ** This file is part of yFiles for HTML 2.4.0.5.
 **
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2022 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
!function(e){var t;t=function(e,t){return function(e,t,i,n){"use strict";var r=t.lang.ClassDefinition,o=(t.lang.InterfaceDefinition,t.lang.AttributeDefinition,t.lang.EnumDefinition,t.lang.StructDefinition,t.lang.Abstract,t.lang.module),a=(t.lang.delegate,t.lang.Number,t.lang.String,t.lang.decorators.OptionArgs),l=t.lang.decorators.SetterArg;t.lang.addMappings("yFiles-for-HTML-Complete-2.4.0.5 (Build 9825e899dca2)",{_$_ege:["aspectRatio","$qba"],_$_fge:["gridSpacing","$rba"],get _$_tzn(){return["CompactOrthogonalLayout","YXC",a(l("gridSpacing"),l("aspectRatio"),l("partitionFinder"),l("partitionPlacer"),l("interEdgeRouter"),l("coreLayout"))]},_$$_fya:["yfiles.orthogonal","yfiles._R.T","yfiles._R.C"]});var f=["Illegal value for grid size: ","Aspect ratio must be greater than zero: "];o("_$$_fya",function(t){t._$_tzn=new r(function(){return{$extends:e.C.AYC,constructor:function(){e.C.AYC.call(this);var t=new e.T.AYC.T2(0,e.TG.$f4);this.$cra=t;var i=new e.C.XXC;i.$QIa=!0,i.$oV=3,this.$Wk=i;var n=new e.T.AYC.T1(null);this.$dra=n,this.$bra=e.GXA.$m(null),this.$qba=1,this.$rba=20},$f:0,$f1:0,$f5:0,$f6:0,_$_fge:{get:function(){return this.$f1},set:function(t){if(t<1)throw e.JG.$m18(f[0]+t);(this.$f1=t,this.$Wk instanceof e.C.XXC)&&(this.$Wk.$sba=t);if(this.$dra instanceof e.T.AYC.T1){var i=this.$dra;i.$f.$gta=2*t,i.$f.$fba=t}var n=this.$bra;n instanceof e.T.AYC.T?n.$f.$lE=new e.C.QYC(0,0,t):n instanceof e.HXA&&(n.$f=.125)}},_$_ege:{get:function(){return this.$f},set:function(t){if(t<=0)throw e.JG.$m18(f[1]+t);(this.$f=t,this.$dra instanceof e.T.AYC.T1)&&(this.$dra.$f.$Tia=new e.C.SBB(t,1));this.$bra instanceof e.HXA&&(this.$bra.$f=.125)}}}})})}(t.lang.module("yfiles._R"),t),t},"function"==typeof define&&define.amd?define(["./lang","./core-lib","./algorithms","./layout-orthogonal","./layout-polyline","./layout-router-bus","./layout-router","./layout-tree","./layout-core"],t):"object"==typeof exports&&"undefined"!=typeof module&&"object"==typeof module.exports?module.exports=t(require("./lang"),require("./core-lib"),require("./algorithms"),require("./layout-orthogonal"),require("./layout-polyline"),require("./layout-router-bus"),require("./layout-router"),require("./layout-tree"),require("./layout-core")):t(e.yfiles.lang,e.yfiles)}("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);