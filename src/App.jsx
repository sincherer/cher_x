import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import Auth from './components/Auth'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Independent from './components/demo';
import UserProfile from './components/UserProfile';
import { Layout, Menu } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

const { Header } = Layout;

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

  return (
    <Router>
      <Layout className="app-container">
        <Header style={{ background: '#fff', padding: 0 }}>
          <Menu mode="horizontal" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Menu.Item key="ai-chat" icon={<MessageOutlined />}>
              <Link to="/ai-chat">AI Chat</Link>
            </Menu.Item>
            <div style={{ marginLeft: 'auto' }}>
              <UserProfile />
            </div>
          </Menu>
        </Header>

        <Layout.Content style={{ padding: '24px' }}>
          <Routes>
            <Route path="/ai-chat" element={<Independent />} />
            <Route path="/" element={<Navigate to="/ai-chat" replace />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </Router>
  )
}

export default App
