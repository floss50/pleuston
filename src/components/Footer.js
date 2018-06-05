import React from 'react'
import './Footer.css'

const Footer = () => (
    <footer className="footer">
        <small>&copy; {(new Date().getFullYear())} <a href="https://oceanprotocol.com">Ocean Protocol Foundation Ltd.</a> &mdash; All Rights Reserved</small>

        <nav className="footer__links">
            <a href="https://blog.oceanprotocol.com">Blog</a>
            <a href="https://twitter.com/oceanprotocol">Twitter</a>
        </nav>
    </footer>
)

export default Footer