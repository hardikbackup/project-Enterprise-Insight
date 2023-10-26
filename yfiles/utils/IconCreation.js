/**
 * Creates an {@link ImageData} icon from a given url.
 * @param ctx The canvas context in which to render the icon.
 * @param url The image url.
 * @param imageSize The render size of the source image.
 * @param iconSize The size of the created ImageData.
 */
export function createUrlIcon(ctx, url, imageSize, iconSize) {
    return new Promise((resolve, reject) => {
        // create an Image from the url
        const image = new Image(imageSize.width, imageSize.height);
        image.onload = () => {
            // render the image into the canvas
            ctx.clearRect(0, 0, iconSize.width, iconSize.height);
            ctx.drawImage(image, 0, 0, imageSize.width, imageSize.height, 0, 0, iconSize.width, iconSize.height);
            const imageData = ctx.getImageData(0, 0, iconSize.width, iconSize.height);
            resolve(imageData);
        };
        image.onerror = () => {
            reject('Loading the image failed.');
        };
        image.src = url;
    });
}
/**
 * Creates an {@link ImageData} icon from a given Font Awesome class.
 * @param ctx The canvas context in which to render the icon.
 * @param fontAwesomeCssClass The name of the Font Awesome icon.
 * @param iconSize The size of the created ImageData.
 */
export function createFontAwesomeIcon(ctx, fontAwesomeCssClass, iconSize) {
    var _a;
    const faHelperElement = getHelperElement();
    // assign the Font Awesome class
    faHelperElement.setAttribute('class', fontAwesomeCssClass);
    // get the computed style to read the font-family, font-weight and text
    const computedStyle = window.getComputedStyle(faHelperElement);
    const beforeComputedStyle = window.getComputedStyle(faHelperElement, ':before');
    const fontFamily = computedStyle.getPropertyValue('font-family');
    const fontWeight = computedStyle.getPropertyValue('font-weight');
    const propertyValue = beforeComputedStyle.getPropertyValue('content');
    // in some browsers, the character is enclosed by quotes
    const text = (_a = propertyValue[1]) !== null && _a !== void 0 ? _a : propertyValue[0];
    // render the text into the canvas
    ctx.clearRect(0, 0, iconSize.width, iconSize.height);
    ctx.font = `${fontWeight} 100px ${fontFamily}`;
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText(text, 64, 14);
    return ctx.getImageData(0, 0, iconSize.width, iconSize.height);
}
/**
 * Gets or creates an <i> element that is used to pre-render the font awesome icon.
 */
function getHelperElement() {
    const faHelperElement = document.getElementById('fa-helper');
    if (faHelperElement != null) {
        return faHelperElement;
    }
    const newElement = document.createElement('i');
    newElement.setAttribute('id', 'fa-helper');
    newElement.setAttribute('style', 'width: 0; height: 0; visibility: hidden');
    document.body.appendChild(newElement);
    return newElement;
}
