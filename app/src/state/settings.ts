
import { shortid } from '@mogs/common'

export const settings = {
  getServerUrl: () => {
    return localStorage.getItem('serverUrl')
  },
  setServerUrl: (url: string) => {
    localStorage.setItem('serverUrl', url)
  },

  getUserName: () => {
    return localStorage.getItem('userName')
  },
  setUserName: (userName: string) => {
    localStorage.setItem('userName', userName)
  },

  getUserId: () => {
    let userId = localStorage.getItem('userId')
    if (!userId) {
      userId = shortid()
      localStorage.setItem('userId', userId!)
    }
    return userId
  }
}
