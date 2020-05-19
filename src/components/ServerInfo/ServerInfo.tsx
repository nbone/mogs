import React, { useEffect, useState } from 'react'

import { getMetadata } from '../../api'
import { Metadata } from '../../types'
import { settings } from '../../state/settings'

const style = require('./server-info.css')

export const ServerInfo: React.FunctionComponent = () => {
  const [meta, setMeta] = useState<Metadata | undefined>()
  const [error, setError] = useState<string | undefined>()

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
    <div className={style.serverInfo} >
      <i className={style.iconServer}></i>
      <div className={style.panel} >
        <div className={style.serverName} >
          Connected to { meta?.server_name }
        </div>
        <div className={style.startupUptime} >
          Up since { meta?.startup_uptime }
        </div>
        <div className={style.messageCount} >
          Message count { meta?.number_of_messages }
        </div>
      </div>
    </div>
  )
}
