import { Injectable } from '@angular/core';
import { ImageNodeStyle, NodeStyleBase, Rect, SimpleNode, SvgVisualGroup } from 'yfiles';

@Injectable({
  providedIn: 'root'
})

export default class NodeStyleDecoratorService extends NodeStyleBase {
  baseStyle: any;
  imageUrl: any;
  imageStyle: any;
  dummyDecorationNode: any;

  /**
   * Initializes a new instance of this class.
   * @param baseStyle The base style.
   * @param imageUrl The URL of the image to use for the decoration.
   */

  constructor(baseStyle, imageUrl) {
    super();
    this.baseStyle = baseStyle;
    this.imageUrl = imageUrl;
    this.imageStyle = new ImageNodeStyle();
    // This dummy node is passed to the image node style to render the decoration image.
    // Its size is the size of the decoration. Its location is adjusted during each createVisual
    // and updateVisual.
    this.dummyDecorationNode = new SimpleNode();
    this.dummyDecorationNode.layout = new Rect(0, 0, 14, 14);
  }

  // set(baseStyle, imageUrl){
  //   this.baseStyle = baseStyle;
  //   this.imageUrl = imageUrl;
  //   this.imageStyle = new ImageNodeStyle();
  //   // This dummy node is passed to the image node style to render the decoration image.
  //   // Its size is the size of the decoration. Its location is adjusted during each createVisual
  //   // and updateVisual.
  //   this.dummyDecorationNode = new SimpleNode();
  //   this.dummyDecorationNode.layout = new Rect(0, 0, 14, 14);
  // }
  /**
   * Creates a new visual as combination of the base node visualization and the decoration.
   * @param context The render context.
   * @param node The node to which this style instance is assigned.
   * @return The created visual.
   * @see NodeStyleBase#createVisual
   */
  createVisual(context, node) {
    if (!this.imageUrl) {
      return this.baseStyle.renderer.getVisualCreator(node, this.baseStyle).createVisual(context);
    }
    const layout = node.layout.toRect();
    // create the base visualization
    const baseVisual = this.baseStyle.renderer
        .getVisualCreator(node, this.baseStyle)
        .createVisual(context);
    // create the decoration
    this.imageStyle.image = this.imageUrl;
    this.dummyDecorationNode.layout = this.getDecorationLayout(layout);
    const decorationRenderer = this.imageStyle.renderer.getVisualCreator(this.dummyDecorationNode, this.imageStyle);
    const decorationVisual = decorationRenderer.createVisual(context);
    // add both to a group
    const group = new SvgVisualGroup();
    group.add(baseVisual);
    group.add(decorationVisual);
    group['data-renderDataCache'] = {
      imageUrl: this.imageUrl
    };
    return group;
  }
  /**
   * Updates the provided visual.
   * @param context The render context.
   * @param oldVisual The visual that has been created in the call to
   *        {@link NodeStyleBase#createVisual}.
   * @param node The node to which this style instance is assigned.
   * @return The updated visual.
   * @see NodeStyleBase#updateVisual
   */
  updateVisual(context, oldVisual, node) {
    if (!this.imageUrl) {
      return this.baseStyle.renderer
          .getVisualCreator(node, this.baseStyle)
          .updateVisual(context, oldVisual);
    }
    const layout = node.layout.toRect();
    // check whether the elements are as expected
    if (!(oldVisual instanceof SvgVisualGroup) || oldVisual.children.size !== 2) {
      return this.createVisual(context, node);
    }
    // update the base visual
    const baseVisual = this.baseStyle.renderer
        .getVisualCreator(node, this.baseStyle)
        .updateVisual(context, oldVisual.children.get(0));
    // check whether the updateVisual method created a new element and replace the old one if needed
    if (baseVisual !== oldVisual.children.get(0)) {
      oldVisual.children.set(0, baseVisual);
    }
    // update the decoration visual
    const oldRenderData = oldVisual['data-renderDataCache'];
    // first, check whether the image URL changed
    if (this.imageUrl !== oldRenderData.imageUrl) {
      this.imageStyle.image = this.imageUrl;
    }
    this.dummyDecorationNode.layout = this.getDecorationLayout(layout);
    const decorationRenderer = this.imageStyle.renderer.getVisualCreator(this.dummyDecorationNode, this.imageStyle);
    const decorationVisual = decorationRenderer.updateVisual(context, oldVisual.children.get(1));
    if (decorationVisual !== oldVisual.children.get(1)) {
      // check whether the updateVisual method created a new element and replace the old one if needed
      oldVisual.children.set(1, decorationVisual);
    }
    // update the stored image URL for the next update visual call
    ;
    oldVisual['data-renderDataCache'] = {
      imageUrl: this.imageUrl
    };
    return oldVisual;
  }
  /**
   * Returns the layout of the decoration for the given node layout.
   * @param nodeLayout The layout of the node.
   * @return The layout of the decoration for the given node layout.
   */
  getDecorationLayout(nodeLayout) {
    const size = this.dummyDecorationNode.layout.toSize();
    return new Rect(nodeLayout.x + (nodeLayout.width - size.width * 1.3), nodeLayout.y + size.height * 0.3, size.width, size.height);
  }
  /**
   * Returns whether at least one of the base visualization and the decoration is visible.
   * @param context The canvas context.
   * @param rectangle The clipping rectangle.
   * @param node The node to which this style instance is assigned.
   * @return <code>true</code> if either the base visualization or the decoration is visible.
   * @see NodeStyleBase#isVisible
   */
  isVisible(context, rectangle, node) {
    return (this.baseStyle.renderer
            .getVisibilityTestable(node, this.baseStyle)
            .isVisible(context, rectangle) ||
        rectangle.intersects(this.getDecorationLayout(node.layout)));
  }
  /**
   * Returns whether the base visualization is hit, we don't want the decoration to be hit testable.
   * @param context The context.
   * @param location The point to test.
   * @param node The node to which this style instance is assigned.
   * @return <code>true</code> if the base visualization is hit.
   * @see NodeStyleBase#isHit
   */
  isHit(context, location, node) {
    return this.baseStyle.renderer.getHitTestable(node, this.baseStyle).isHit(context, location);
  }
  /**
   * Returns whether the base visualization is in the box, we don't want the decoration to be marquee selectable.
   * @param context The input mode context.
   * @param rectangle The marquee selection box.
   * @param node The node to which this style instance is assigned.
   * @return <code>true</code> if the base visualization is hit.
   * @see NodeStyleBase#isInBox
   */
  isInBox(context, rectangle, node) {
    // return only box containment test of baseStyle - we don't want the decoration to be marquee selectable
    return this.baseStyle.renderer
        .getMarqueeTestable(node, this.baseStyle)
        .isInBox(context, rectangle);
  }
  /**
   * Gets the intersection of a line with the visual representation of the node.
   * @param node The node to which this style instance is assigned.
   * @param inner The coordinates of a point lying
   *   {@link NodeStyleBase#isInside inside} the shape.
   * @param outer The coordinates of a point lying outside the shape.
   * @return The intersection point if one has been found or <code>null</code>, otherwise.
   * @see NodeStyleBase#getIntersection
   */
  getIntersection(node, inner, outer) {
    return this.baseStyle.renderer
        .getShapeGeometry(node, this.baseStyle)
        .getIntersection(inner, outer);
  }
  /**
   * Returns whether the provided point is inside of the base visualization.
   * @param node The node to which this style instance is assigned.
   * @param location The point to test.
   * @return <code>true</code> if the provided location is inside of the base visualization.
   * @see NodeStyleBase#isInside
   */
  isInside(node, location) {
    // return only inside test of baseStyle
    return this.baseStyle.renderer.getShapeGeometry(node, this.baseStyle).isInside(location);
  }
}
