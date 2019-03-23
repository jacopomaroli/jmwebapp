
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

class EntryContent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}

    const doc = (global && global.jsdom) ? global.jsdom.window.document : document

    const container = doc.createElement('div')
    container.innerHTML = this.props.content
    if (this.props.type === 'excerpt') {
      this.removeCodeAfterReadMore(container)
    }
    this.contentToRender = <div className='entry-content' dangerouslySetInnerHTML={{ __html: container.innerHTML }} />
    this.render = this.render.bind(this)
  }

  removeCodeAfterReadMore (contentToRender) {
    let moreElement

    for (let j = 0; j < contentToRender.children.length; j++) {
      const elem = contentToRender.children[j]
      if (elem.tagName !== 'P') {
        continue
      }
      for (let i = 0; i < elem.childNodes.length; i++) {
        let node = elem.childNodes[i]
        if (node.nodeType === 8 && !node.textContent.indexOf('more')) { // Node.COMMENT_NODE
          moreElement = elem
          break
        }
      }
    }

    if (moreElement) {
      let found = false
      for (let i = 0; i < contentToRender.childNodes.length; i++) {
        let node = contentToRender.childNodes[i]
        if (node === moreElement) {
          found = true
        }
        if (found) {
          node.parentNode.removeChild(node)
        }
      }
    }
  }

  componentDidMount () {
    const current = ReactDOM.findDOMNode(this)
    const nodes = current.querySelectorAll('pre code')
    Array.prototype.forEach.call(nodes, (node) => {
      window.Prism.highlightElement(node, false)
    })
  }

  render () {
    return this.contentToRender
  }
}

EntryContent.propTypes = {
  content: PropTypes.string,
  type: PropTypes.string
}

export default EntryContent
