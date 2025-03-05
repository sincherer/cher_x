import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Badge, Button, Space } from 'antd';
import {
  CloudUploadOutlined,
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import './AIChatInterface.css';
import { generateAIResponse } from '../huggingface';
const renderTitle = (icon, title) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);
const defaultConversationsItems = [
  {
    key: '0',
    label: 'There might some hot pie for you to choose!',
  },
];
const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 722px;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    placeholder: css`
      padding-top: 32px;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
  };
});
export default function AIChatInterface() {
  const { styles } = useStyle();
  const [content, setContent] = useState('');
  const [profileData, setProfileData] = useState({
    profile: null,
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });
  const [userProfile, setUserProfile] = useState(null);
  // Initialize chat messages state
  const [chatMessages, setChatMessages] = useState([]);
  const fetchChatHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const formattedMessages = data.map(msg => ({
          id: msg.id.toString(),
          message: msg.text,
          status: msg.sender === 'user' ? 'local' : 'ai'
        }));
        setMessages(formattedMessages);
        setChatMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  }, [setMessages])
  
  // Generate context-based response using profile data
  const generateContextBasedResponse = async (message) => {
    try {
      // First check for matching Q&A
      const qaMatch = await findMatchingQA(message);
      if (qaMatch) {
        console.log('Found matching Q&A:', qaMatch);
        return qaMatch.answer;
      }

      // Use profile data to provide context-aware responses
      const context = {
        profile: profileData.profile,
        workExperience: profileData.workExperience,
        skills: profileData.skills
      };
      
      console.log('Generating AI response with context:', context);
      const response = await generateAIResponse(message, context);
      
      if (!response) {
        console.error('No response generated from AI');
        throw new Error('Failed to generate AI response');
      }
      
      console.log('Generated AI response:', response);
      return response;
    } catch (error) {
      console.error('Error generating context-based response:', error);
      throw error; // Let the calling function handle the error
    }
  };
  const fetchProfileData = async () => {
    try {
      const [profileRes, workRes, eduRes, skillsRes, projectsRes, certificationsRes] = await Promise.all([
        supabase.from('profile').select('*').single(),
        supabase.from('work_experience').select('*').order('start_date', { ascending: false }),
        supabase.from('education').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('certifications').select('*')
      ]);
    setProfileData({
      profile: profileRes.data,
      workExperience: workRes.data || [],
      education: eduRes.data || [],
      skills: skillsRes.data || [],
      projects: projectsRes.data || [],
      certifications: certificationsRes.data || []
    });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };
  const placeholderPromptsItems = [
    {
      key: '1',
      label: renderTitle(
        <FireOutlined
          style={{
            color: '#FF4D4F',
          }}
        />,
        'Hot Topics',
      ),
      description: 'Can you joke?',
      children: [
        {
          key: '1-1',
          description: `What's new in Professional AI?`,
        },
        {
          key: '1-2',
          description: `What's AGI?`,
        },
        {
          key: '1-3',
          description: `Where is the doc?`,
        },
      ],
    },
    {
      key: '2',
      label: renderTitle(
        <ReadOutlined
          style={{
            color: '#1890FF',
          }}
        />,
        'Design Guide',
      ),
      description: 'How to design a good product?',
      children: [
        {
          key: '2-1',
          icon: <HeartOutlined />,
          description: `Know the well`,
        },
        {
          key: '2-2',
          icon: <SmileOutlined />,
          description: `Set the AI role`,
        },
        {
          key: '2-3',
          icon: <CommentOutlined />,
          description: `Express the feeling`,
        },
      ],
    },
  ];
  const senderPromptsItems = [
    {
      key: '1',
      description: 'Hot Topics',
      icon: (
        <FireOutlined
          style={{
            color: '#FF4D4F',
          }}
        />
      ),
    },
    {
      key: '2',
      description: 'Design Guide',
      icon: (
        <ReadOutlined
          style={{
            color: '#1890FF',
          }}
        />
      ),
    },
  ];
  const roles = {
    ai: {
      placement: 'start',
      typing: {
        step: 5,
        interval: 20,
      },
      styles: {
        content: {
          borderRadius: 16,
        },
      },
    },
    local: {
      placement: 'end',
      variant: 'shadow',
    },
  };
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess }) => {
      try {
        // Save user message first
        await saveMessage(message, 'user');

        // Check for Q&A match
        const qaMatch = await findMatchingQA(message);
        let response;

        if (qaMatch) {
          response = qaMatch.answer;
        } else {
          // Generate context-based response if no Q&A match found
          response = await generateContextBasedResponse(message);
        }

        if (!response) {
          throw new Error('Failed to generate a response');
        }

        // Store AI response in Supabase
        await saveMessage(response, 'ai');
        onSuccess(response);
      } catch (error) {
        console.error('Error in request handler:', error);
        const errorMessage = 'I apologize, but I am currently experiencing difficulties. Please try asking your question in a different way.';
        await saveMessage(errorMessage, 'ai');
        onSuccess(errorMessage);
      }
    },
  });
  const { onRequest, messages, setMessages } = useXChat({
    agent,
    initialMessages: [],
  });
  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (!profile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([{
            id: user.id,
            display_name: user.email.split('@')[0],
            email: user.email
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return;
        }

        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchChatHistory();
  }, [fetchChatHistory]);
  useEffect(() => {
    fetchProfileData();
  }, []);

  const onSubmit = async (nextContent) => {
    try {
      if (!nextContent || nextContent.trim().length === 0) return;
      
      const messageId = Date.now().toString();
      
      // 1. Add user message to chat immediately for instant feedback
      setMessages(prev => [...prev, {
        id: messageId,
        message: nextContent,
        status: 'local'
      }]);
      
      // 2. Save user message to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');
      
      const { data: chatSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: user.id,
          topic_name: 'General Chat'
        }])
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          user_id: user.id,
          chat_session_id: chatSession.id,
          text: nextContent,
          sender: 'user'
        }]);
      
      if (messageError) throw messageError;
      
      // 3. Check QA table for matching response
      const { data: qaMatch, error: qaError } = await supabase
        .from('qa_pairs')
        .select('answer')
        .ilike('question', `%${nextContent}%`)
        .limit(1)
        .single();
      
      if (qaError && qaError.code !== 'PGRST116') throw qaError;
      
      let aiResponse;
      if (qaMatch) {
        aiResponse = qaMatch.answer;
      } else {
        // If no QA match, use the agent for response
        await onRequest(nextContent);
      }
      
      if (aiResponse) {
        // Save AI response to messages and display it
        await supabase
          .from('messages')
          .insert([{
            user_id: user.id,
            chat_session_id: chatSession.id,
            text: aiResponse,
            sender: 'ai'
          }]);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: aiResponse,
        status: 'ai'
      }]);
      }
      
      // Clear input field
      setContent('');
    } catch (error) {
      console.error('Error in message submission:', error);
      // Show error message in chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Sorry, there was an error sending your message. Please try again.',
        status: 'ai'
      }]);
    }
  };

  const onPromptsItemClick = (info) => {
    onRequest(info.data.description);
  };

  const items = messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message,
  }));

  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        <div className={styles.logo}>
          <img src="/vite.svg" alt="logo" />
          <span>Professional AI</span>
        </div>
        <div className={styles.conversations}>
          <Prompts
            items={placeholderPromptsItems}
            onItemClick={onPromptsItemClick}
          />
        </div>
      </div>
      <div className={styles.chat}>
        <div className={styles.messages}>
          {items.length === 0 ? (
            <Welcome
              className={styles.placeholder}
              title="Welcome to SinCher's AI"
              description="Ask me anything about her!"
            />
          ) : (
            <Bubble items={items} roles={roles} />
          )}
        </div>
        <Sender
          className={styles.sender}
          value={content}
          onChange={setContent}
          onSubmit={onSubmit}
          prompts={{
            items: senderPromptsItems,
            onItemClick: onPromptsItemClick,
          }}
        />
      </div>
    </div>
  );
}