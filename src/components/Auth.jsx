import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Form, Input, Button, Card, Typography } from 'antd'
import { UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)

  const handleAuth = async (values) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                display_name: values.displayName
              }
            },
          })
        : await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          })

      if (error) throw error
      if (isSignUp) {
        alert('Check your email for the confirmation link!')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 20px' }}>
      <Card>
        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Typography.Title>
        <Form onFinish={handleAuth} layout="vertical">
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              type="email"
              placeholder="Email"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          {isSignUp && (
            <Form.Item
              name="displayName"
              rules={[{ required: true, message: 'Please input your display name!' }]}
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder="Display Name"
                size="large"
              />
            </Form.Item>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Button type="link" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Button>
          </Form.Item>
        </Form>
        {error && (
          <Typography.Text type="danger" style={{ display: 'block', textAlign: 'center' }}>
            {error}
          </Typography.Text>
        )}
      </Card>
    </div>
  )
}