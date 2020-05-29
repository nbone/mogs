import React from 'react'

const style = require('./icon-button.css')

export const IconButton: React.FunctionComponent = (props) => {
  const { iconName, isActive, className } = props
  const compoundClassName = style.icon + ' ' + (isActive ? style.active : '') + ' ' + className

  return (
    <i className={compoundClassName}>{iconName}</i>
  )
}
