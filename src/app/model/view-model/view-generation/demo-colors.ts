/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.0.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
export type ColorSetName =
    | 'demo-orange'
    | 'demo-blue'
    | 'demo-red'
    | 'demo-green'
    | 'demo-purple'
    | 'demo-lightblue';

export type ColorSet = {
    fill: string
    stroke: string
    nodeLabelFill: string
    edgeLabelFill: string
    text: string
}

export const colorSets: Record<ColorSetName, ColorSet> = {
    'demo-orange': {
        fill: '#ff6c00',
        stroke: '#662b00',
        nodeLabelFill: '#ffc499',
        edgeLabelFill: '#c2aa99',
        text: '#662b00'
    },
    'demo-blue': {
        fill: '#242265',
        stroke: '#0e0e28',
        nodeLabelFill: '#a7a7c1',
        edgeLabelFill: '#9f9ea9',
        text: '#0e0e28'
    },
    'demo-red': {
        fill: '#ca0c3b',
        stroke: '#510518',
        nodeLabelFill: '#ea9eb1',
        edgeLabelFill: '#b99ba2',
        text: '#510518'
    },
    'demo-green': {
        fill: '#61a044',
        stroke: '#27401b',
        nodeLabelFill: '#c0d9b4',
        edgeLabelFill: '#a9b3a4',
        text: '#27401b'
    },
    'demo-purple': {
        fill: '#a37ab3',
        stroke: '#413148',
        nodeLabelFill: '#dacae1',
        edgeLabelFill: '#b3adb6',
        text: '#413148'
    },
    'demo-lightblue': {
        fill: '#46a8d5',
        stroke: '#1c4355',
        nodeLabelFill: '#b5dcee',
        edgeLabelFill: '#a4b4bb',
        text: '#1c4355'
    },
}
