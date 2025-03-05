
import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';

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
import { Badge, Button, Space } from 'antd';
const renderTitle = (icon, title) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);
const defaultConversationsItems = [
  {
    key: '0',
    label: 'What is Ant Design X?',
  },
];
const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      height: 100%; /* Full screen height */
      display: flex;
      flex-direction: column;
      padding: 24px;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
    `,

    chat: css`
      flex: 1;
      width: 100%;
      max-width: 1200px; /* Prevents excessive stretching */
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      padding: 12px; /* Small padding for better spacing */
      gap: 8px;

      @media (max-width: 768px) {
        padding: 8px;
      }
    `,

    messages: css`
      flex: 1;
      
      overflow-y: auto; /* Allows scrolling */
      display: flex;
      flex-direction: column;
      gap: 8px; /* Small spacing between messages */
      padding-bottom: 60px; /* Prevents messages from touching sender box */
    `,

    sender: css`
      position: sticky;
      bottom: 0;
      background: ${token.colorBgContainer};
      padding: 0px; /* Small margin for spacing */
      margin: 24px 8px; /* Prevents it from being too clumped */
      border-radius: 8px;
      box-shadow: ${token.boxShadow};
      justify-content: center;
      z-index: 10; /* Keeps it above messages */
    `,

    logo: css`
      display: flex;
      height: 60px;
      align-items: center;
      padding: 0 16px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
      }

      span {
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
        width: 100%;
      }
    `,
  };
});


const placeholderPromptsItems = [
  {
    key: '1',
    label: renderTitle(
      <FireOutlined
        style={{
          color: '#FF4D4F',
        }}
      />,
      'Hot Pie',
    ),
    description: 'What are you interested in?',
    children: [
      {
        key: '1-1',
        description: `Who is SinCher?`,
      },
      {
        key: '1-2',
        description: `Coffee?`,
      },
      {
        key: '1-3',
        description: `Random fun jokes`,
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
      'About me',
    ),
    description: 'The AI Assistant',
    children: [
      {
        key: '2-1',
        icon: <HeartOutlined />,
        description: `So cool!`,
      },
      {
        key: '2-2',
        icon: <SmileOutlined />,
        description: `Why were you created?`,
      },
      {
        key: '2-3',
        icon: <CommentOutlined />,
        description: `What if I don't like UX?`,
      },
    ],
  },
];
const senderPromptsItems = [
  {
    key: '1',
    description: 'Coffee?',
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
    description: 'Joke?',
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
const Independent = () => {
  // ==================== Style ====================
  const { styles } = useStyle();

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [content, setContent] = React.useState('');
  
  const [_conversationsItems, _setConversationsItems] = React.useState(defaultConversationsItems);
 const [activeKey, _setActiveKey] = React.useState(defaultConversationsItems[0].key);
  const [attachedFiles, _setAttachedFiles] = React.useState([]);


  // ==================== Grab user ID ====================
const getUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data?.user?.id || null; // ✅ Corrected `user.id`
};

// ==================== Runtime ====================
const [agent] = useXAgent({
  request: async ({ message }, { onSuccess }) => {
    const userId = await getUserId();
    if (!userId) {
      console.error("User is not logged in");
      onSuccess("Error: User not authenticated.");
      return;
    }

    // Fetch AI reply from Supabase
    const { data, error } = await supabase
      .from('qa_pairs')
      .select('answer')
      .ilike('question', `%${message}%`) // Case-insensitive search
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      onSuccess("Sorry, an error occurred while fetching the response.");
      return;
    }

    let reply = "Sorry, I couldn't find an answer to that.";
    if (data && data.length > 0) {
      reply = data[0].answer;
    }

    // 🌟 Save User's Message
    await supabase.from('messages').insert([
      {
        user_id: userId,
        text: message,
        sender: 'user',
        created_at: new Date().toISOString(),
      },
    ]);

    // 🌟 Save AI Response
    await supabase.from('messages').insert([
      {
        user_id: userId,
        text: reply,
        sender: 'ai',
        created_at: new Date().toISOString(),
      },
    ]);

    // Return the AI response
    onSuccess(reply);
  },
});

const { onRequest, messages, setMessages } = useXChat({
  agent,
});

// Clear messages when switching conversation tabs
useEffect(() => {
  if (activeKey !== undefined) {
    setMessages([]);
  }
}, [activeKey]);


  // ==================== Event ====================
  const onSubmit = (nextContent) => {
    if (!nextContent) return;
    onRequest(nextContent);
    setContent('');
  };
  const onPromptsItemClick = (info) => {
    onRequest(info.data.description);
  };
  /** hide this addConversation  
   * const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `New Conversation ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
  };
  const onConversationClick = (key) => {
    setActiveKey(key);
  };

  end of AddConversation **/
  const handleFileChange = (info) => _setAttachedFiles(info.fileList);

  

  // ==================== Nodes ====================
  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      <Welcome
        variant="borderless"
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="Hello, I'm Sin Cher's Assistant"
        description="Ask me anything about her :)"
        extra={
          <Space>
            
          </Space>
        }
      />
      <Prompts
        title=" "
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );
  const items = messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message,
  }));
  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      
    </Badge>
  );
  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === 'drop'
            ? {
                title: 'Drop file here',
              }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
      />
    </Sender.Header>
  );
  const logoNode = (
    <div className={styles.logo}>
      
    </div>
  );

  // ==================== Render =================
  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        {/* 🌟 Logo */}
        {logoNode}
        {/* 🌟 添加会话 */}
        {/* <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          New Conversation
        </Button> */}
        {/* 🌟 会话管理 
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat}> */}
        {/* 🌟 消息列表 */}
        <Bubble.List
          items={
            items.length > 0
              ? items
              : [
                  {
                    content: placeholderNode,
                    variant: 'borderless',
                  },
                ]
          }
          roles={roles}
          className={styles.messages}
        />
        {/* 🌟 提示词 */}
        <Prompts items={senderPromptsItems} onItemClick={onPromptsItemClick} />
        {/* 🌟 输入框 */}
        <Sender
          value={content}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={setContent}
          prefix={attachmentsNode}
          loading={agent.isRequesting()}
          className={styles.sender}
        />
      </div>
    </div>
  );
};

export default Independent;