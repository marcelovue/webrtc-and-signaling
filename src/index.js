import React from 'react'
import { render } from 'react-dom'
import io from 'socket.io-client'

import App from 'Containers/app'

let audioEL = document.querySelector('.audio')

render(<App/>, document.querySelector('.root'))
