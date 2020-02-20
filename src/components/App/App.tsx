import React, { useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components/macro'
import { TextEditor } from 'src/components/Editor'
import { AudioPlayer } from 'src/components/AudioPlayer'
import { useSample } from 'src/hooks'

const GlobalStyle = createGlobalStyle`
    html {
        width: 100%;
        min-height: 100vh;
        margin: 0;
        padding: 0;
    }
    body {
        width: 100%;
        min-height: 100vh;
        margin: 0;
        padding: 0;
    }
    #root {
        width: 100%;
        min-height: 100vh;
    }
`
const Container = styled.div`
    display: flex;
    width: 100%;
    min-height: 100vh;
    flex: 1;
    justify-content: center;
    background: rgb(248, 249, 250);
`

const Page = styled.div`
    width: 70%;
    margin: 25px 0;
    padding: 40px 80px;
    background: #fff;
    box-shadow: rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    color: #222222;
    font-family: 'Literata', sans-serif;
    font-size: 18px;
    letter-spacing: 0.07px;
    line-height: 140%;
`

export const App = () => {
    const sample = '1525310'

    const { loading, paragraphs, audio } = useSample(sample)

    const audioTiming = paragraphs
        ? {
              start: paragraphs[0].timing.start,
              end: paragraphs[paragraphs.length - 1].timing.end,
          }
        : { start: 0, end: 0 }

    const [currentTime, setCurrentTime] = useState(audioTiming.start)

    return (
        <>
            <GlobalStyle />
            <Container>
                {paragraphs && (
                    <>
                        <Page>
                            <TextEditor paragraphs={paragraphs} currentTime={currentTime} />
                        </Page>
                        <AudioPlayer src={audio} timing={audioTiming} onTimeUpdate={setCurrentTime} />
                    </>
                )}
            </Container>
        </>
    )
}
