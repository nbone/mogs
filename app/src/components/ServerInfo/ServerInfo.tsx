import React, { useEffect, useState } from 'react'

import { getMetadata } from '../../api'
import { Metadata } from '../../types'
import { settings } from '../../state/settings'
import { Panel } from '../Panel'
import { IconButton } from '../IconButton'

const style = require('./server-info.css')

export const ServerInfo: React.FunctionComponent = () => {
  const [meta, setMeta] = useState<Metadata | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [panelVisible, setPanelVisible] = useState(false)

  const serverUrl = settings.getServerUrl()
  // TODO: set server URL if unset (or allow editing it anyway)

  useEffect(() => {
    getMetadata(serverUrl)
      .then(meta => {
        console.log(meta)
        setMeta(meta)
      })
      .catch(e => {
        console.error(e)
        setError('Something bad has happened')
      })
  }, [])

  if (error) {
    return (
      <div className={style.serverInfo} >
        <div className={style.error}>{error}</div>
      </div>
    )
  }

  return (
    <div className={style.serverInfo}
      onMouseEnter={() => setPanelVisible(true)}
      onMouseLeave={() => setPanelVisible(false)}>
      <IconButton iconName='router' isActive={panelVisible} />
      {panelVisible ?
        <Panel className={style.panel} >
          <div className={style.serverName} >
            Connected to {serverUrl}
          </div>
          <div className={style.startupUptime} >
            Up since {meta?.upSince}
          </div>
          <div className={style.messageCount} >
            Message count {meta?.messageCount}
          </div>
        </Panel>
        : ''
      }
    </div>
  )
}
