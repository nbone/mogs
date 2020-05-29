import React, { useState } from 'react'
import { settings } from '../../state/settings'
import { Panel } from '../Panel'
import { IconButton } from '../IconButton'

const style = require('./profile.css')

export const Profile: React.FunctionComponent = () => {
  const [name, setName] = useState(settings.getUserName() || '')
  const [panelVisible, setPanelVisible] = useState(false)

  function handleChange (event) {
    const val = event.target.value
    settings.setUserName(val)
    setName(val)
  }

  return (
    <div className={style.profile}
      onMouseEnter={() => setPanelVisible(true)}
      onMouseLeave={() => setPanelVisible(false)}>
      <IconButton iconName='person' isActive={panelVisible} />
      {panelVisible ?
        <Panel className={style.panel}>
          You are signed in as<br />
          <input type='text' name='name' value={name} onChange={handleChange} />
        </Panel>
        : ''
      }
    </div>
  )
}

