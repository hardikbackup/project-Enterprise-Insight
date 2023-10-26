import { Injectable } from '@angular/core';
import { GraphComponent, Point, TimeSpan, Workarounds } from 'yfiles'

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {
  private graphComponent!: GraphComponent
  element: HTMLElement
  focusOutListener: (e: FocusEvent) => void
  focusInListener: (e: FocusEvent) => void
  closeListener: (e: Event) => void
  closeOnEscListener: (e: KeyboardEvent) => void
  blurredTimeout: number | null
  isOpen: boolean
  private onClosedCallbackField: () => void

  constructor() {

  }

  /**
   * Creates a new empty menu.
   *
   * @param {GraphComponent} graphComponent The graph component of this context menu.
   */
  set(graphComponent: GraphComponent) {
    const contextMenu = document.createElement('div')
    contextMenu.setAttribute('class', 'demo-context-menu')
    this.element = contextMenu
    this.blurredTimeout = null
    this.isOpen = false
    this.onClosedCallbackField = null!

    // Listeners for focus events since this menu closes itself if it loses the focus.
    this.focusOutListener = (evt: FocusEvent): void => {
      this.onFocusOut(evt.relatedTarget as HTMLElement)
    }

    this.focusInListener = (): void => {
      if (this.blurredTimeout) {
        clearTimeout(this.blurredTimeout)
        this.blurredTimeout = null
      }
    }

    // A click listener that closes the menu and calls the onCloseCallback.
    // This way, the individual menu items do not need to handle this by themselves.
    this.closeListener = (evt): void => {
      evt.stopPropagation()
      this.close()
      // Set the focus to the graph component
      graphComponent.focus()
      this.onClosedCallback()
    }

    // A ESC key press listener that closes the menu and calls the callback.
    this.closeOnEscListener = (evt): void => {
      if (evt.keyCode === 27 && this.element.parentNode) {
        this.closeListener(evt)
      }
    }

    // We lower the default long-press duration to 100ms to avoid conflicts between the context menu and
    // other gestures on long-press, e.g. edge creation.
    graphComponent.longPressTime = TimeSpan.fromMilliseconds(100)
  }

  /**
   * Adds a new separator to this menu.
   */
  addSeparator(): void {
    const separator = document.createElement('div')
    separator.setAttribute('class', 'demo-separator')
    this.element.appendChild(separator)
  }

  /**
   * Adds a new menu entry with the given text and click-listener to this menu.
   */
  addMenuItem(label: string, clickListener: ((e: MouseEvent) => void) | null): HTMLElement {
    const menuItem = document.createElement('button')
    menuItem.setAttribute('class', 'demo-menu-item')
    menuItem.innerHTML = label
    if (clickListener !== null) {
      menuItem.addEventListener('click', clickListener, false)
    }
    this.element.appendChild(menuItem)
    return menuItem
  }

  /**
   * Removes all menu entries and separators from this menu.
   */
  clearItems(): void {
    const element = this.element
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }

  /**
   * Shows this menu at the given location.
   *
   * This menu only shows if it has at least one menu item.
   *
   * @param {Point} location The location of the menu relative to the left edge of the entire
   *   document. This are typically the pageX and pageY coordinates of the contextmenu event.
   */
  show(location: Point): void {
    if (this.element.childElementCount <= 0) {
      return
    }
    this.element.addEventListener('focusout', this.focusOutListener)
    this.element.addEventListener('focusin', this.focusInListener)
    this.element.addEventListener('click', this.closeListener, false)
    document.addEventListener('keydown', this.closeOnEscListener, false)

    // Set the location of this menu and append it to the body
    const style = this.element.style
    style.setProperty('position', 'absolute', '')
    style.setProperty('left', `${location.x}px`, '')
    style.setProperty('top', `${location.y}px`, '')
    if (document.fullscreenElement && !document.fullscreenElement.contains(document.body)) {
      document.fullscreenElement.appendChild(this.element)
    } else {
      document.body.appendChild(this.element)
    }

    // trigger enter animation
    setTimeout(() => {
      this.element.setAttribute('class', `${this.element.getAttribute('class')} visible`)
    }, 0)
    ;(this.element.firstElementChild! as HTMLElement).focus()
    this.isOpen = true
  }

  /**
   * Closes this menu.
   */
  close(): void {
    this.element.removeEventListener('focusout', this.focusOutListener)
    this.element.removeEventListener('focusin', this.focusInListener)
    this.element.removeEventListener('click', this.closeListener, false)
    document.removeEventListener('keydown', this.closeOnEscListener, false)

    const parentNode = this.element.parentNode
    if (parentNode) {
      // trigger fade-out animation on a clone
      const contextMenuClone = this.element.cloneNode(true) as HTMLElement
      contextMenuClone.setAttribute(
          'class',
          `${contextMenuClone.getAttribute('class')} demo-context-menu-clone`
      )
      parentNode.appendChild(contextMenuClone)
      // fade the clone out, then remove it from the DOM. Both actions need to be timed.
      setTimeout(() => {
        contextMenuClone.setAttribute(
            'class',
            contextMenuClone.getAttribute('class')!.replace(/\s?visible/, '')
        )

        setTimeout(() => {
          parentNode.removeChild(contextMenuClone)
        }, 300)
      }, 0)

      this.element.setAttribute(
          'class',
          this.element.getAttribute('class')!.replace(/\s?visible/, '')
      )
      parentNode.removeChild(this.element)
    }

    this.isOpen = false
  }

  /**
   * Sets a callback function that is invoked if the context menu closed itself, for example because a
   * menu item was clicked.
   *
   * Typically, the provided callback informs the <code>ContextMenuInputMode</code> that this menu is
   * closed.
   */
  get onClosedCallback() {
    if (this.onClosedCallbackField == null) {
      alert('For this context menu, the onClosedCallback property must be set.')
    }
    return this.onClosedCallbackField
  }

  set onClosedCallback(callback: () => void) {
    this.onClosedCallbackField = callback
  }

  /**
   * Adds event listeners for events that should show the context menu. These listeners then call the provided
   * openingCallback function.
   *
   * Besides the obvious <code>contextmenu</code> event, we listen for long presses and the Context Menu key.
   *
   * A long touch press doesn't trigger a <code>contextmenu</code> event on all platforms therefore we listen to the
   * GraphComponent's TouchLongPress event
   *
   * The Context Menu key is not handled correctly in Chrome. In other browsers, when the Context Menu key is
   * pressed, the correct <code>contextmenu</code> event is fired but the event location is not meaningful.
   * In this case, we set a better location, centered on the given element.
   *
   * @param {GraphComponent} graphComponent The graph component of this context menu.
   * @param {function(Point)} openingCallback This function is called when an event that should
   *   open the context menu occurred. It gets the location of the event.
   */
  addOpeningEventListeners(
      graphComponent: GraphComponent,
      openingCallback: (p: Point) => void
  ): void {
    const componentDiv = graphComponent.div
    const contextMenuListener = (evt: MouseEvent & { mozInputSource?: number }): void => {
      evt.preventDefault()
      if (this.isOpen) {
        // might be open already because of the longpress listener
        return
      }
      const me = evt
      if (evt.mozInputSource === 1 && me.button === 0) {
        // This event was triggered by the context menu key in Firefox.
        // Thus, the coordinates of the event point to the lower left corner of the element and should be corrected.
        openingCallback(this.getCenterInPage(componentDiv))
      } else if (me.pageX === 0 && me.pageY === 0) {
        // Most likely, this event was triggered by the context menu key in IE.
        // Thus, the coordinates are meaningless and should be corrected.
        openingCallback(this.getCenterInPage(componentDiv))
      } else {
        openingCallback(new Point(me.pageX, me.pageY))
      }
    }

    // Listen for the contextmenu event
    // Note: On Linux based systems (e.g. Ubuntu), the contextmenu event is fired on mouse down
    // which triggers the ContextMenuInputMode before the ClickInputMode. Therefore handling the
    // event, will prevent the ItemRightClicked event from firing.
    // For more information, see https://docs.yworks.com/yfileshtml/#/kb/article/780/
    componentDiv.addEventListener('contextmenu', contextMenuListener, false)

    if (this.detectSafariVersion() > 0 || this.detectiOSVersion() > 0) {
      // Additionally add a long press listener especially for iOS, since it does not fire the contextmenu event.
      let contextMenuTimer: number | undefined
      graphComponent.addTouchDownListener((sender, args) => {
        contextMenuTimer = setTimeout(() => {
          openingCallback(
              graphComponent.toPageFromView(graphComponent.toViewCoordinates(args.location))
          )
        }, 500) as any as number
      })
      graphComponent.addTouchUpListener(() => {
        clearTimeout(contextMenuTimer)
      })
    }

    // Listen to the context menu key to make it work in Chrome
    componentDiv.addEventListener('keyup', evt => {
      if (evt.keyCode === 93) {
        evt.preventDefault()
        openingCallback(this.getCenterInPage(componentDiv))
      }
    })
  }

  /**
   * Closes the context menu when it lost the focus.
   *
   * @param {HTMLElement} relatedTarget The related target of the focus event.
   *
   * @private
   */
  onFocusOut(relatedTarget: HTMLElement): void {
    // focusout can also occur when the focus shifts between the buttons in this context menu.
    // We have to find out if none of the buttons has the focus and focusout is real
    if (relatedTarget) {
      if (relatedTarget.parentElement && relatedTarget.parentElement !== this.element) {
        this.close()
      }
    } else if (!this.blurredTimeout) {
      // If the browser doesn't provide a related target, we wait a little bit to see whether the focus is given to
      // another button in this context menu
      this.element.addEventListener('focusin', this.focusInListener)
      this.blurredTimeout = setTimeout(() => {
        this.close()
      }, 350) as any as number
    }
  }

  /**
   * Calculates the location of the center of the given element in absolute coordinates relative to the body element.
   *
   * @param {HTMLElement} element
   * @return {Point}
   *
   * @private
   */
  getCenterInPage(element: HTMLElement): Point {
    let left = element.clientWidth / 2.0
    let top = element.clientHeight / 2.0
    while (element.offsetParent) {
      left += element.offsetLeft
      top += element.offsetTop
      element = element.offsetParent as HTMLElement
    }
    return new Point(left, top)
  }

  detectChromeVersion(): number {
    // Edge pretends to be every browser...
    const ieVersion = this.detectInternetExplorerVersion()
    if (ieVersion === -1) {
      if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
        return -1
      }
      const ua = window.navigator.userAgent
      const chrome = ua.match(new RegExp('Chrome\\/([0-9]+)', ''))
      if (chrome !== null) {
        return parseInt(chrome[1])
      }
    }
    return -1
  }

  detectInternetExplorerVersion(): number {
    // environments without window object
    if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
      return -1
    }

    const ua = window.navigator.userAgent
    const msie = ua.indexOf('MSIE ')
    if (msie > 0) {
      return parseInt(ua.substr(msie + 5, ua.indexOf('.', msie)), 10)
    }

    const trident = ua.indexOf('Trident/')
    if (trident > 0) {
      // IE 11 => return version number
      const rv = ua.indexOf('rv:')
      return parseInt(ua.substr(rv + 3, ua.indexOf('.', rv)), 10)
    }

    const edge = ua.indexOf('Edge/')
    if (edge > 0) {
      // IE 12 => return version number
      return parseInt(ua.substr(edge + 5, ua.indexOf('.', edge)), 10)
    }

    return -1
  }

  detectSafariVersion(): number {
    const ua = window.navigator.userAgent
    const isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1
    if (isSafari) {
      const safariVersionMatch = ua.match(new RegExp('Version\\/(\\d*\\.\\d*)', ''))
      if (safariVersionMatch && safariVersionMatch.length > 1) {
        return parseInt(safariVersionMatch[1])
      }
    }
    return -1
  }

  detectiOSVersion(): number {
    const ua = window.navigator.userAgent

    // @ts-ignore
    if (window.MSStream) {
      // this is IE
      return -1
    }
    if (/iPad|iPhone|iPod/.test(ua)) {
      if (window.indexedDB) {
        return 8
      }
      if (window.SpeechSynthesisUtterance) {
        return 7
      }
      // @ts-ignore
      if (window.webkitAudioContext) {
        return 6
      }
      // @ts-ignore
      if (window.matchMedia) {
        return 5
      }
      if (window.history && 'pushState' in window.history) {
        return 4
      }
      return 3
    }
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      // This works as long as there are no macOS devices with touch
      return 13
    }
    return -1
  }
}
