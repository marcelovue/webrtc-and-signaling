import { observable, get, computed } from 'mobx'

class HomeStore {
  @observable user = {
    id: '1', name: 'Marcelo'
  }
  @observable users = []
  @observable name = 'Marcelo'
}
export default new HomeStore()
