
import { throwIfNotFunction, throwIfNotNonEmptyString,
  isDefined, throwIfNotPositiveNumber } from '@carnesen/checks'

export function promisify (func, options) {
  throwIfNotFunction(func, 'func')
  options = options || {}
  return (...args) => new Promise((resolve, reject) => {
    func(...args, (err, ...rets) => {
      if (err) {
        if (options.rejectArray) {
          reject([err, ...rets])
        } else {
          reject(err)
        }
      } else {
        if (options.resolveArray) {
          resolve([...rets])
        } else {
          resolve([...rets][0])
        }
      }
    })
  })
}

function attachTimedEventCallback ({ event, timeout }) {
  throwIfNotFunction(event.emitter.once, 'event.emitter.once')
  throwIfNotFunction(event.emitter.removeListener, 'event.emitter.removeListener')
  throwIfNotNonEmptyString(event.name, 'event.name')
  throwIfNotFunction(event.callback, 'event.callback')
  throwIfNotFunction(timeout.callback, 'timeout.callback')

  if (isDefined(timeout.interval)) {
    throwIfNotPositiveNumber(timeout.interval, 'timeout.interval')
  }

  let timeoutId

  function eventHandler (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    event.callback(...args)
  }

  function timeoutHandler () {
    event.emitter.removeListener(event.name, eventHandler)
    timeout.callback()
  }

  if (timeout.interval) {
    timeoutId = setTimeout(timeoutHandler, timeout.interval)
  }

  event.emitter.once(event.name, eventHandler)
}

export function waitForEvent (emitter, name, interval) {
  return new Promise((resolve, reject) => {
    attachTimedEventCallback({
      event: {
        emitter,
        name,
        callback (value) {
          resolve(value)
        }
      },
      timeout: {
        interval,
        callback () {
          const message = `Timed out after ${interval} milliseconds waiting for event "${name}"`
          reject(new Error(message))
        }
      }
    })
  })
}

export function waitForNonEvent (emitter, name, interval) {
  return new Promise((resolve, reject) => {
    attachTimedEventCallback({
      event: {
        emitter,
        name,
        callback (value) {
          const err = new Error(`Emitter emitted event "${name}"`)
          err.value = value
          reject(err)
        }
      },
      timeout: {
        interval,
        callback: resolve
      }
    })
  })
}

export function delay (interval) {
  const startTime = Date.now()
  return new Promise(resolve =>
    setTimeout(() => resolve(Date.now() - startTime), interval)
  )
}

export function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function makeMethodName (string) {
  const parts = string.split(/[ -]/).map(part => part.toLowerCase())
  return `${parts[0]}${parts.slice(1).map(capitalizeFirstLetter).join('')}`
}
