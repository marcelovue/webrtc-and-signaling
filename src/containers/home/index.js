import React from 'react'
import { IO } from 'Classes/Socket'
import { observer } from 'mobx-react'

@observer(['home'])
class Home extends React.Component {
  ioConnect() {
    let { user } = this.props.home
    IO.connect({
      query: { user: JSON.stringify(user) }
    })
  }
  componentDidMount() {
    this.ioConnect()
  }
  render() {
    let { users } = this.props.home
    if (!users) return null;
    return (
      <React.Fragment>
        <h1>Usuarios online</h1>
        {
          users.map((user, k) => {
            return <p key={k}>{user.name}</p>
          })
        }
      </React.Fragment>
    )
  }
}

export default Home
