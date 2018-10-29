import { autorun, toJS } from 'mobx'
import home from './home'

const stores = {
  home
}
window.stores = stores

// autorun(() => {
//   console.log('users', toJS(stores.home.users))
// })

export default stores
