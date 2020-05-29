import React from 'react'

const style = require('./panel.css')

export const Panel: React.FunctionComponent = (props) => {
  const { children, className } = props

  return (
    <div className={style.panel + ' ' + className}>
      {children}
    </div>
  )
}
