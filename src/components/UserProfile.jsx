import { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Modal, Form, Input, message } from 'antd';
import { UserOutlined, LogoutOutlined, KeyOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { supabase } from '../supabaseClient';

export default function UserProfile() {
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isDisplayNameModalVisible, setIsDisplayNameModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      message.error('Error logging out: ' + error.message);
    }
  };

  const handlePasswordReset = async (values) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });
      if (error) throw error;
      message.success('Password updated successfully');
      setIsPasswordModalVisible(false);
    } catch (error) {
      message.error('Error updating password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (values) => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.updateUser({
        email: values.newEmail
      });
      if (authError) throw authError;

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: values.newEmail,
          display_name: userProfile?.display_name || user.email
        });

      if (profileError) throw profileError;

      message.success('Email update confirmation sent to your new email');
      setIsEmailModalVisible(false);
      await fetchUserProfile();
    } catch (error) {
      message.error('Error updating email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayNameChange = async (values) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          display_name: values.displayName,
          email: userProfile?.email || user.email
        });

      if (error) throw error;
      message.success('Display name updated successfully');
      setIsDisplayNameModalVisible(false);
      await fetchUserProfile();
    } catch (error) {
      message.error('Error updating display name: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
      <Menu.Item key="password" icon={<KeyOutlined />} onClick={() => setIsPasswordModalVisible(true)}>
        Reset Password
      </Menu.Item>
      <Menu.Item key="email" icon={<MailOutlined />} onClick={() => setIsEmailModalVisible(true)}>
        Change Email
      </Menu.Item>
      <Menu.Item key="displayName" icon={<IdcardOutlined />} onClick={() => setIsDisplayNameModalVisible(true)}>
        Update Display Name
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Dropdown overlay={menu} placement="bottomRight">
        <Button type="text" icon={<UserOutlined />}>
          {userProfile?.display_name || 'User'}
        </Button>
      </Dropdown>

      <Modal
        title="Reset Password"
        open={isPasswordModalVisible}
        onCancel={() => setIsPasswordModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handlePasswordReset}>
          <Form.Item
            name="newPassword"
            rules={[{ required: true, message: 'Please input your new password!' }]}
          >
            <Input.Password placeholder="New Password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('The two passwords do not match!');
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Change Email"
        open={isEmailModalVisible}
        onCancel={() => setIsEmailModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleEmailChange}>
          <Form.Item
            name="newEmail"
            rules={[
              { required: true, message: 'Please input your new email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="New Email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Update Email
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Update Display Name"
        open={isDisplayNameModalVisible}
        onCancel={() => setIsDisplayNameModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleDisplayNameChange}>
          <Form.Item
            name="displayName"
            rules={[{ required: true, message: 'Please input your new display name!' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="New Display Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Update Display Name
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}