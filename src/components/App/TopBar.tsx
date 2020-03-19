import React from 'react'
import styled from 'styled-components/macro'
import barThumbImage from './bar-thumb.png'

const Bar = styled.div`
    width: 100%;
    height: 55px;
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    align-items: center;
    background-color: rgb(53, 60, 68);
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.75);
    z-index: 2;
`

const Logo = styled.div`
    width: 100px;
    height: 22px;
    margin-left: 20px;
    margin-top: -4px;
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnNlPSJodHRwOi8vc3ZnLWVkaXQuZ29vZ2xlY29kZS5jb20iIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiIHdpZHRoPSIzNjUiIGhlaWdodD0iOTciIHN0eWxlPSIiPjxyZWN0IGlkPSJiYWNrZ3JvdW5kcmVjdCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgeD0iMCIgeT0iMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJub25lIi8+ICAgICAgICAgICAgIDxnIGNsYXNzPSJjdXJyZW50TGF5ZXIiIHN0eWxlPSIiPjxnIGNsYXNzPSIiIGlkPSJzdmdfMSI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIGQ9Ik0wLDM1IEMwLDM1IDI3LDM1IDI2LDM0IEMyNywzNSAyNywzOSAyNyw0MSBDMjYsNDMgMTksNDQgMTksNDQgQzE5LDQ0IDMzLDgyIDMzLDgyIEMzMyw4MiA0OCw0NCA0OCw0NCBDNDgsNDQgNDIsNDMgNDEsNDIgQzQwLDQxIDQwLDM3IDQwLDM1IEM0MSwzNSA2NywzNSA2NywzNSBDNjcsMzUgNjcsNDAgNjYsNDIgQzY1LDQzIDU5LDQzIDU5LDQzIEM1OSw0MyAzOCw5NSAzOCw5NSBDMzgsOTUgMjgsOTUgMjgsOTUgQzI4LDk1IDgsNDQgOCw0MyBDNyw0MyAyLDQzIDAsNDEgQy0wLDQwIDAsMzUgMCwzNSB6IiBzdHlsZT0iY29sb3I6IHJnYigwLCAwLCAwKTsiIGNsYXNzPSIiIGlkPSJzdmdfMTciLz48cGF0aCBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgaWQ9InN2Z18xNiIgZD0iTTc4LDU4IEM3OCw1OCAxMTAsNTggMTEwLDU4IEMxMTAsNTggMTEyLDQxIDk0LDQyIEM3Nyw0MiA3MCw3MSA4NCw4MyBDOTcsOTUgMTE0LDgxIDExNCw4MSBDMTE0LDgxIDExOSw4NiAxMTksODYgQzExOSw4NiAxMTQsOTQgMTAwLDk1IEM4Niw5NyA2Nyw5MCA2Niw2NiBDNjYsNDIgODIsMzAgMTAyLDM1IEMxMjIsNDAgMTE5LDY1IDExOSw2NSBDMTE5LDY1IDg1LDY1IDc3LDY1IEw3OCw1OCB6IiBzdHlsZT0iY29sb3I6IHJnYigwLCAwLCAwKTsiIGNsYXNzPSIiLz48cGF0aCBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgaWQ9InN2Z18yIiBkPSJNMTIyLDM1IEMxMjIsMzUgMTM3LDM0IDEzOSwzNiBDMTQxLDM4IDE0MCw0NyAxNDAsNDcgQzE0MCw0NyAxNDcsMzYgMTU0LDM1IEMxNjAsMzMgMTYzLDM0IDE2NywzNiBDMTY4LDM5IDE2Nyw0NCAxNjUsNDUgQzE2Miw0NyAxNTksNDIgMTUxLDQ1IEMxNDQsNDggMTQxLDUzIDE0MSw1OCBDMTQxLDYzIDE0MSw4MCAxNDEsODYgQzE0NCw4NyAxNDgsODYgMTQ5LDg4IEMxNTAsOTAgMTUwLDk1IDE1MCw5NSBDMTUwLDk1IDEyMSw5NSAxMjEsOTUgQzEyMSw5NSAxMjEsOTEgMTIyLDg5IEMxMjQsODcgMTI2LDg3IDEzMCw4NiBDMTMwLDcyIDEzMCw1MSAxMzAsNDQgQzEyOCw0MiAxMjMsNDMgMTIyLDQyIEMxMjEsMzkgMTIyLDM1IDEyMiwzNSB6IiBzdHlsZT0iY29sb3I6IHJnYigwLCAwLCAwKTsiIGNsYXNzPSIiLz48cGF0aCBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgaWQ9InN2Z180IiBkPSJNMTY4LDcgQzE2OCw3IDE4OSw3IDE4OSw3IEMxODksMTcgMTg5LDg2IDE4OSw4NiBDMTg5LDg2IDIwMSw5MCAyMTAsODYgQzIyMCw4MCAyMTksNzMgMjIwLDY1IEMyMjAsNDkgMjE3LDQ4IDIxMyw0NCBDMTk4LDM4IDE4OSw1MiAxODksNTIgQzE4OSw1MiAxODksNDMgMTg5LDQzIEMxODksNDMgMTk4LDMyIDIxMiwzNCBDMjMwLDM3IDIzMiw1NyAyMzEsNjcgQzIzMSw4NCAyMjIsODkgMjE5LDkxIEMyMTAsOTcgMTk5LDk3IDE3OCw5MyBDMTc4LDc1IDE3OCwxNiAxNzgsMTYgQzE3NSwxNiAxNjksMTQgMTY5LDE0IEMxNjksMTQgMTY4LDExIDE2OCw3IHoiIHN0eWxlPSJjb2xvcjogcmdiKDAsIDAsIDApOyIgY2xhc3M9IiIvPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSIgc3Ryb2tlPSJub25lIiBpZD0ic3ZnXzEwIiBkPSJNMjQ0LDQ0IEMyNDQsNDQgMjQ0LDg2IDI0NCw4NiBDMjQ0LDg2IDIzNyw4NyAyMzYsODkgQzIzNSw5MCAyMzUsOTUgMjM1LDk1IEMyMzUsOTUgMjYzLDk1IDI2Myw5NSBDMjYzLDk1IDI2NCw5MCAyNjIsODkgQzI2MSw4OCAyNTcsODYgMjU0LDg2IEMyNTQsNzMgMjU0LDM1IDI1NCwzNSBDMjU0LDM1IDIzNSwzNSAyMzUsMzUgQzIzNSwzNSAyMzUsNDAgMjM2LDQxIEMyMzgsNDMgMjQ0LDQ0IDI0NCw0NCB6IiBzdHlsZT0iY29sb3I6IHJnYigwLCAwLCAwKTsiIGNsYXNzPSIiLz48cGF0aCBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgaWQ9InN2Z18xMiIgZD0iTTI3NywxNSBDMjc3LDE1IDI3NiwyOSAyNzUsMzYgQzI3MCwzNiAyNjUsMzcgMjY1LDM3IEMyNjUsMzcgMjY0LDQyIDI2NSw0MyBDMjY3LDQ0IDI2OSw0NCAyNzQsNDQgQzI3NCw1MSAyNzQsNzYgMjc0LDgzIEMyNzUsOTAgMjc5LDk2IDI4OSw5NiBDMzAwLDk2IDMwNCw5MCAzMDQsOTAgQzMwNCw5MCAyOTksODQgMjk5LDg0IEMyOTksODQgMjk2LDg4IDI5MSw4OCBDMjg3LDg3IDI4NSw4NSAyODUsODEgQzI4NCw2OSAyODUsNDQgMjg1LDQ0IEMyODUsNDQgMzAyLDQ0IDMwMiw0NCBDMzAyLDQwIDMwMiwzNiAzMDIsMzYgQzI5NCwzNiAyODUsMzUgMjg1LDM1IEMyODUsMzUgMjg1LDE1IDI4NSwxNSBDMjg1LDE1IDI4MSwxNSAyNzcsMTUgeiIgc3R5bGU9ImNvbG9yOiByZ2IoMCwgMCwgMCk7IiBjbGFzcz0iIi8+PHBhdGggZmlsbD0iIzAwZDRiMyIgZmlsbC1vcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIGlkPSJzdmdfMTQiIGQ9Ik0zMDgsMCBDMzA4LDAgMzE4LDAgMzI1LDYgQzMzMSwxMiAzMzMsMTYgMzM3LDI0IEMzNDAsMTYgMzQzLDEwIDM1MCw1IEMzNTcsLTAgMzY1LDAgMzY1LC0xZS0xNSBDMzY1LDAgMzY1LDcgMzY1LDcgQzM2NSw3IDM1MSw4IDM0NSwyMSBDMzM5LDM0IDM0MCw0NiAzNDAsNDYgQzM0MCw0NiAzMzIsNDYgMzMyLDQ2IEMzMzIsNDYgMzMzLDM1IDMyOCwyMiBDMzIyLDkgMzA4LDcgMzA4LDcgQzMwOCw3IDMwNywxIDMwOCwwIHoiIHN0eWxlPSJjb2xvcjogcmdiKDAsIDAsIDApOyIgY2xhc3M9IiIvPjwvZz48cGF0aCBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLW9wYWNpdHk9IjEiIGQ9Ik0yNDIsMTYgQzI0MiwxMiAyNDUsOSAyNDksOSBDMjUyLDkgMjU2LDEyIDI1NiwxNiBDMjU2LDIwIDI1MiwyNCAyNDksMjQgQzI0NSwyNCAyNDIsMjAgMjQyLDE2IHoiIGlkPSJzdmdfNSIgY2xhc3M9IiIvPjwvZz48L3N2Zz4=)
        0 0 / contain no-repeat;
`

const UserProfileLink = styled.div`
    display: flex;
    align-items: center;
    margin-right: 16px;
`
const Avatar = styled.div`
    width: 27px;
    height: 27px;
    border: 1px solid white;
    border-radius: 7px;
    background-image: url(${barThumbImage});
    background-size: contain;
    margin-right: 4px;
`

const DropDownCaret = styled.div`
    display: inline-block;
    color: #fff;
    width: 0;
    height: 0;
    vertical-align: middle;
    content: '';
    border-top-style: solid;
    border-top-width: 4px;
    border-right: 4px solid transparent;
    border-bottom: 0 solid transparent;
    border-left: 4px solid transparent;
`

export const TopBar = () => {
    return (
        <Bar>
            <Logo />
            <UserProfileLink>
                <Avatar />
                <DropDownCaret />
            </UserProfileLink>
        </Bar>
    )
}
