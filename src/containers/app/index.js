import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Home from 'Containers/home'

//MOBX
import stores from 'Stores'
import { Provider } from 'mobx-react'

class App extends React.Component {
  render() {
    return (
      <Provider home={stores.home}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/home" component={Home}/>
          </Switch>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default App
