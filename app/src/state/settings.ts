
import { shortid } from '@mogs/common'

// TODO: Eventually we'll autogenerate the User ID when the user name is set and put it in localStorage.
// BUT for now we're keeping it in memory to facilitate multi-user testing in the same browser.
const userId: string = shortid()

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
    return userId
  }
}
