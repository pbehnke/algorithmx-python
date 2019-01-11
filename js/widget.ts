import { DOMWidgetModel, DOMWidgetView, ISerializers } from '@jupyter-widgets/base'
import { MODULE_NAME, MODULE_VERSION } from './version'
import * as buttonUtils from './buttons'

import * as algorithmx from 'algorithmx'

export class CanvasModel extends DOMWidgetModel {
  defaults() {
    return {...super.defaults(),
      _model_name: CanvasModel.model_name,
      _model_module: CanvasModel.model_module,
      _model_module_version: CanvasModel.model_module_version,
      _view_name: CanvasModel.view_name,
      _view_module: CanvasModel.view_module,
      _view_module_version: CanvasModel.view_module_version,

      _dispatch_events: []
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
  }

  static model_name = 'CanvasModel'
  static model_module = MODULE_NAME
  static model_module_version = MODULE_VERSION
  static view_name = 'CanvasModel'
  static view_module = MODULE_NAME
  static view_module_version = MODULE_VERSION
}

export class CanvasView extends DOMWidgetView {
  private client: algorithmx.Client | null = null
  private canvas: algorithmx.CanvasSelection | null = null
  private eventIndex = 0

  private stopped = false

  playEvents(events: ReadonlyArray<string>) {
    if (this.client === null) return
    events.forEach(eventStr => {
      const event = JSON.parse(eventStr) as algorithmx.DispatchEvent
      this.client!.dispatch(event)
    })
  }

  playAllEvents() {
    const events = this.model.get('_dispatch_events')
    this.playEvents(events)
  }

  eventsChanged() {
    if (this.client === null) return

    const events: ReadonlyArray<string> = this.model.get('_dispatch_events')
    const newEvents = events.slice(this.eventIndex)
    this.eventIndex = events.length

    this.playEvents(newEvents)
  }

  resetCanvas() {
    if (this.canvas === null) return
    const immediateCanvas = this.canvas.eventQ(null).duration(0)
    immediateCanvas.cancelall().startall()
    immediateCanvas.remove()
    immediateCanvas.add().size([400, 250]).zoomkey(true)
    setTimeout(() => { immediateCanvas.svgattr('width', '100%') }, 1)
  }

  removeCanvas() {
    this.resetCanvas()

    const element: Element = this.el
    const canvasDiv = element.querySelector('algorithmx-container')
    if (canvasDiv !== null) element.removeChild(canvasDiv)

    const buttonDiv = element.querySelector('algorithmx-buttons')
    if (buttonDiv !== null) element.removeChild(buttonDiv)
  }

  remove() {
    this.removeCanvas()
    super.remove()
  }

  clickRestart() {
    if (this.canvas === null) return

    this.resetCanvas()
    this.playAllEvents()
    this.stopped = false
  }

  clickStart () {
    if (this.canvas === null) return
    this.canvas.eventQ(null).startall()
    this.stopped = false
  }

  clickStop () {
    if (this.canvas === null) return
    this.canvas.eventQ(null).stopall()
    this.stopped = true
  }

  renderButtons() {
    const element: Element = this.el

    const buttonDiv = document.createElement('div')

    const buttonPlay = buttonUtils.createButton('pause', () => {
      if (this.stopped) {
        buttonUtils.setIcon(buttonPlay, 'pause')
        this.clickStart()
      } else {
        buttonUtils.setIcon(buttonPlay, 'play')
        this.clickStop()
      }
    })

    const buttonRestart = buttonUtils.createButton('repeat', () => {
      buttonUtils.setIcon(buttonPlay, 'pause')
      this.clickRestart()
    })

    buttonDiv.appendChild(buttonPlay)
    buttonDiv.appendChild(buttonRestart)

    element.appendChild(buttonDiv)
  }

  render() {
    this.removeCanvas()

    const canvasDiv = document.createElement('div')
    canvasDiv.setAttribute('id', 'algorithmx-container')

    this.client = algorithmx.client(canvasDiv)

    this.client.subscribe(event => {
      const fullEvent = { source: 'algorithmx', data: event }
      const fullEventStr = JSON.stringify(fullEvent)
      this.send(fullEventStr)
    })

    this.canvas = this.client.canvas()
    this.resetCanvas()

    const element: Element = this.el
    element.appendChild(canvasDiv)

    const showButtons = this.model.get('_show_buttons')
    if (showButtons) this.renderButtons()

    this.model.on('change:_dispatch_events', this.eventsChanged, this)
    this.eventsChanged()
  }
}
