/// <reference types="styled-components/cssprop" />

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import { FocusStyleManager } from '@blueprintjs/core'
import { App } from './components/App'

FocusStyleManager.onlyShowFocusOnTabs()

ReactDOM.render(<App />, document.getElementById('root'))
