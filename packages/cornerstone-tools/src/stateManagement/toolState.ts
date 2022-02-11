import {
  getEnabledElement,
  triggerEvent,
  eventTarget,
} from '@precisionmetrics/cornerstone-render'
import { CornerstoneTools3DEvents as EVENTS } from '../enums'
import { Types } from '@precisionmetrics/cornerstone-render'
import { defaultFrameOfReferenceSpecificToolStateManager } from './FrameOfReferenceSpecificToolStateManager'
import { uuidv4 } from '../util'
import {
  ToolSpecificToolState,
  ToolSpecificToolData,
} from '../types/toolStateTypes'

function getDefaultToolStateManager() {
  return defaultFrameOfReferenceSpecificToolStateManager
}

function getViewportSpecificStateManager(
  element?: Types.IEnabledElement | HTMLElement
) {
  // TODO:
  // We may want multiple FrameOfReferenceSpecificStateManagers.
  // E.g. displaying two different radiologists annotations on the same underlying data/FoR.

  // Just return the default for now.

  return defaultFrameOfReferenceSpecificToolStateManager
}

// TODO: Why is this now using enabledElement instead of element?
/**
 * getToolState - Returns the toolState for the `FrameOfReference` of the `Viewport`
 * being viewed by the cornerstone3D enabled `element`.
 *
 * @param {HTMLElement} element
 * @param {string} toolName
 * @returns {ToolSpecificToolState} The tool state corresponding to the Frame of Reference and the toolName.
 */
function getToolState(
  // element: HTMLElement,
  enabledElement: Types.IEnabledElement,
  toolName: string
): ToolSpecificToolState {
  const toolStateManager = getViewportSpecificStateManager(enabledElement)
  const { FrameOfReferenceUID } = enabledElement

  return toolStateManager.get(FrameOfReferenceUID, toolName)
}

/**
 * @function addToolState
 *
 * @param {HTMLElement} element
 * @param {ToolSpecificToolData} toolData
 */
function addToolState(
  element: HTMLElement,
  toolData: ToolSpecificToolData
): void {
  const toolStateManager = getViewportSpecificStateManager(element)

  if (toolData.metadata.toolDataUID === undefined) {
    toolData.metadata.toolDataUID = uuidv4() as string
  }

  toolStateManager.addToolState(toolData)

  // trigger measurement added
  const enabledElement = getEnabledElement(element)
  const { renderingEngine } = enabledElement
  const { viewportUID } = enabledElement

  const eventType = EVENTS.MEASUREMENT_ADDED

  const eventDetail = {
    toolData,
    viewportUID,
    renderingEngineUID: renderingEngine.uid,
  }

  triggerEvent(eventTarget, eventType, eventDetail)
}

/**
 * @function removeToolState
 *
 * @param {*} element
 * @param {*} toolData
 */
function removeToolState(
  element: HTMLElement,
  toolData: ToolSpecificToolData
): void {
  const toolStateManager = getViewportSpecificStateManager(element)
  toolStateManager.removeToolState(toolData)

  // trigger measurement removed
  const enabledElement = getEnabledElement(element)
  const { renderingEngine } = enabledElement
  const { viewportUID } = enabledElement

  const eventType = EVENTS.MEASUREMENT_REMOVED

  const eventDetail = {
    toolData,
    viewportUID,
    renderingEngineUID: renderingEngine.uid,
  }

  triggerEvent(eventTarget, eventType, eventDetail)
}

/**
 * @function removeToolStateByToolDataUID
 *
 * @param {*} element
 * @param {*} toolDataUID
 */
function removeToolStateByToolDataUID(
  element: HTMLElement,
  toolDataUID: string
): void {
  const toolStateManager = getViewportSpecificStateManager(element)

  const toolData = toolStateManager.getToolStateByToolDataUID(toolDataUID)
  toolStateManager.removeToolStateByToolDataUID(toolDataUID)

  // trigger measurement removed
  const enabledElement = getEnabledElement(element)
  const { renderingEngine } = enabledElement
  const { viewportUID } = enabledElement

  const eventType = EVENTS.MEASUREMENT_REMOVED

  const eventDetail = {
    toolData,
    viewportUID,
    renderingEngineUID: renderingEngine.uid,
  }

  triggerEvent(eventTarget, eventType, eventDetail)
}

function getToolDataByToolDataUID(
  toolDataUID: string,
  element?: HTMLElement
): ToolSpecificToolData {
  const toolStateManager = getViewportSpecificStateManager(element)
  const toolData = toolStateManager.getToolStateByToolDataUID(toolDataUID)

  return toolData
}

export {
  getToolState,
  addToolState,
  getToolDataByToolDataUID,
  removeToolState,
  removeToolStateByToolDataUID,
  getViewportSpecificStateManager,
  getDefaultToolStateManager,
}
