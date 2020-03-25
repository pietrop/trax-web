import React from 'react'
import styled, { createGlobalStyle } from 'styled-components/macro'
import { Session } from 'src/components/Session'
import { HttpClient } from 'src/network'
import { TopBar } from './TopBar'

const httpClient = new HttpClient({ baseUrl: 'http://localhost:8080' })

const GlobalStyle = createGlobalStyle`
    html {
        width: 100%;
        min-width: 700px;
        height: 100vh;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
    body {
        width: 100%;
        height: 100vh;
        margin: 0;
        padding: 0;
    }
    #root {
        width: 100%;
        height: 100vh;
    }
`
const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
    flex: 1;
    flex-direction: column;
    background: rgb(246, 248, 250);
`

export const App = () => {
    return (
        <>
            <GlobalStyle />
            <Container>
                <TopBar />
                <Session transport={httpClient} />
            </Container>
        </>
    )
}
