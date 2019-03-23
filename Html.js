import React from 'react'
import PropTypes from 'prop-types'

const Html2 = ({ content, helmet, assets, state }) => {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />
        <meta name='theme-color' content='#000000' />
        <link rel='manifest' href='/manifest.json' />
        <link rel='shortcut icon' href='/favicon.ico' />

        <link rel='stylesheet' href='/css/prism.dev.css' />

        {helmet.meta.toComponent()}
        {helmet.title.toComponent()}
        {assets.css &&
          assets.css.map((c, idx) => (
            <link key={idx} href={c} rel='stylesheet' />
          ))}
      </head>

      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id='root' dangerouslySetInnerHTML={{ __html: content }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(
              /</g,
              '\\u003c'
            )};`
          }}
        />
        {assets.jsInline &&
          assets.jsInline.map((j, idx) => (
            <script key={idx}
              dangerouslySetInnerHTML={{
                __html: j
              }}
            />
          ))}
        {assets.js &&
          assets.js.map((j, idx) => (
            <script key={idx} src={j} />
          ))}
      </body>
    </html>
  )
}

const Html = ({ content, helmet, assets, state }) => {
  console.log('\n\n' + helmet.meta.toString())
  return (
    <html lang='en' dangerouslySetInnerHTML={{ __html: content }} />
  )
}

Html.propTypes = {
  content: PropTypes.string,
  helmet: PropTypes.any,
  assets: PropTypes.any,
  state: PropTypes.any
}

export default Html
