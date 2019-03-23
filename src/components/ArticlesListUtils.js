import React from 'react'

function genLoadNewer (baseUrl, postData, componentRef, loadNewerFn) {
  let dateCursor = new Date(postData.post_date)
  dateCursor.setSeconds(dateCursor.getSeconds() + 1)
  const dateISO = dateCursor.toISOString()

  return (
    <a className='loadNewer framedPaperInset postLoaderTrigger show'
      href={baseUrl + '?from=' + dateISO}
      onClick={e => {
        e.preventDefault()
        loadNewerFn(dateCursor, componentRef)
      }}>
      <span>Load newer posts</span>
    </a>
  )
}

function genLoadOlder (baseUrl, postData, componentRef, loadOlderFn) {
  let dateCursor = new Date(postData.post_date)
  dateCursor.setSeconds(dateCursor.getSeconds() - 1)
  const dateISO = dateCursor.toISOString()

  return (
    <a className='loadOlder framedPaperInset postLoaderTrigger show'
      href={baseUrl + '?to=' + dateISO}
      onClick={e => {
        e.preventDefault()
        loadOlderFn(dateCursor, componentRef)
      }}>
      <span>Load older posts</span>
    </a>
  )
}

function disableLoadNewer (component, instance) {
  component.props.showLoadNewer = false
  if (!instance.setState) return
  instance.setState((state) => {
    return { ...state, showLoadNewer: false }
  })
}

function disableLoadOlder (component, instance) {
  component.props.showLoadOlder = false
  if (!instance.setState) return
  instance.setState((state) => {
    return { ...state, showLoadOlder: false }
  })
}

export {
  genLoadNewer,
  genLoadOlder,
  disableLoadNewer,
  disableLoadOlder
}
