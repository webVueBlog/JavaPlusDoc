import React, { useState } from 'react';
import { Layout, Menu, Card, Avatar, Row, Col, Tag, Button, Divider, Progress, Statistic, Timeline, Typography, Space } from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  TrophyOutlined, 
  MailOutlined, 
  GithubOutlined, 
  WechatOutlined,
  LinkedinOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  RocketOutlined,
  CodeOutlined,
  DatabaseOutlined,
  CloudOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

function App() {
  const [currentSection, setCurrentSection] = useState('home');

  const projects = [
    {
      title: '企业级电商平台',
      company: '阿里巴巴',
      role: '高级前端工程师',
      duration: '2023.03 - 2023.12',
      description: '负责淘宝商家后台系统的核心模块开发，优化页面性能提升30%，支持千万级商家使用。',
      image: 'https://via.placeholder.com/400x250/1890ff/ffffff?text=E-commerce+Platform',
      link: '#',
      tags: ['React', 'TypeScript', 'Node.js', 'Redis', 'Docker'],
      metrics: [
        { label: '性能提升', value: '30%' },
        { label: '用户规模', value: '1000万+' },
        { label: '代码覆盖率', value: '85%' }
      ],
      highlights: [
        '使用 React 18 + TypeScript 重构核心组件，提升开发效率',
        '实现微前端架构，支持多团队并行开发',
        '优化首屏加载时间从 3s 降至 1.5s'
      ]
    },
    {
      title: '短视频推荐系统',
      company: '字节跳动',
      role: '全栈开发工程师',
      duration: '2022.06 - 2023.02',
      description: '参与抖音推荐算法前端展示层开发，负责用户交互优化和数据分析模块。',
      image: 'https://via.placeholder.com/400x250/52c41a/ffffff?text=Video+Recommendation',
      link: '#',
      tags: ['Vue3', 'Python', 'MongoDB', 'Kafka', 'Elasticsearch'],
      metrics: [
        { label: '用户留存', value: '+15%' },
        { label: '推荐准确率', value: '92%' },
        { label: '系统可用性', value: '99.9%' }
      ],
      highlights: [
        '设计并实现实时数据可视化面板，支持千万级数据展示',
        '优化推荐算法前端交互，提升用户点击率 20%',
        '构建 A/B 测试框架，支持快速迭代验证'
      ]
    },
    {
      title: '微信小程序商城',
      company: '腾讯',
      role: '小程序开发工程师',
      duration: '2021.09 - 2022.05',
      description: '独立开发微信小程序商城，包含商品展示、购物车、支付等完整功能模块。',
      image: 'https://via.placeholder.com/400x250/faad14/ffffff?text=WeChat+Mini+Program',
      link: '#',
      tags: ['微信小程序', '云开发', 'WXML', 'WXSS', 'JavaScript'],
      metrics: [
        { label: '日活用户', value: '5万+' },
        { label: '转化率', value: '8.5%' },
        { label: '用户评分', value: '4.8/5' }
      ],
      highlights: [
        '使用微信云开发，实现服务端零运维',
        '集成微信支付，支持多种支付方式',
        '实现商品推荐算法，提升用户购买转化率'
      ]
    },
    {
      title: '蓝湖设计系统',
      company: '自研项目',
      role: 'UI/UX 设计师 + 前端开发',
      duration: '2021.03 - 2021.08',
      description: '设计并开发企业级设计系统，包含组件库、设计规范、原型工具等。',
      image: 'https://via.placeholder.com/400x250/722ed1/ffffff?text=Design+System',
      link: '#',
      tags: ['Figma', 'React', 'Storybook', 'Sass', 'Webpack'],
      metrics: [
        { label: '组件数量', value: '50+' },
        { label: '设计效率', value: '+40%' },
        { label: '团队规模', value: '20人' }
      ],
      highlights: [
        '建立完整的设计规范和组件库',
        '开发可视化原型工具，提升设计效率',
        '与产品、开发团队协作，确保设计落地'
      ]
    }
  ];

  const skills = {
    '前端技术': ['React', 'Vue3', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Sass/Less'],
    '后端技术': ['Node.js', 'Python', 'Java', 'Express', 'Koa', 'Spring Boot'],
    '数据库': ['MySQL', 'MongoDB', 'Redis', 'PostgreSQL', 'Elasticsearch'],
    '云服务': ['AWS', '阿里云', '腾讯云', '微信云开发', 'Docker', 'Kubernetes'],
    '工具平台': ['Git', 'Webpack', 'Vite', 'Jenkins', '蓝湖', 'Figma', 'Sketch']
  };

  const experiences = [
    { 
      year: '2023.03 - 至今', 
      company: '阿里巴巴',
      role: '高级前端工程师',
      content: '负责淘宝商家后台系统开发，优化系统性能，支持千万级用户。'
    },
    { 
      year: '2022.06 - 2023.02', 
      company: '字节跳动',
      role: '全栈开发工程师',
      content: '参与抖音推荐系统开发，负责前端展示层和数据分析模块。'
    },
    { 
      year: '2021.09 - 2022.05', 
      company: '腾讯',
      role: '小程序开发工程师',
      content: '独立开发微信小程序商城，实现完整的电商功能。'
    },
    { 
      year: '2019.09 - 2021.08', 
      company: 'XX互联网公司',
      role: '前端开发工程师',
      content: '参与多个Web应用开发，积累丰富的项目经验。'
    }
  ];

  const education = {
    school: '清华大学',
    major: '计算机科学与技术',
    degree: '本科',
    year: '2015-2019',
    gpa: '3.8/4.0',
    courses: ['数据结构', '算法设计', '软件工程', '数据库系统', '计算机网络']
  };

  const renderHome = () => (
    <div style={{ padding: '40px 0' }}>
      <Row gutter={[40, 40]} align="middle">
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Avatar size={150} icon={<UserOutlined />} style={{ marginBottom: 24, border: '4px solid #1890ff' }} />
          <Title level={2}>张三</Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>高级前端工程师</Text>
        </Col>
        <Col xs={24} md={16}>
          <Title level={3}>个人简介</Title>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
            5年前端开发经验，曾在阿里巴巴、字节跳动、腾讯等一线互联网公司工作。
            擅长 React、Vue、TypeScript 等前端技术栈，具备全栈开发能力。
            主导过多个大型项目，对性能优化、架构设计有丰富经验。
            热爱技术，持续学习，追求代码质量和用户体验的完美平衡。
          </Paragraph>
          
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col>
              <Button type="primary" icon={<MailOutlined />} size="large">
                联系我
              </Button>
            </Col>
            <Col>
              <Button icon={<GithubOutlined />} size="large">
                GitHub
              </Button>
            </Col>
            <Col>
              <Button icon={<LinkedinOutlined />} size="large">
                LinkedIn
              </Button>
            </Col>
            <Col>
              <Button icon={<WechatOutlined />} size="large">
                微信
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 24]} style={{ marginTop: 40 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="工作年限" value={5} suffix="年" prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="项目经验" value={20} suffix="+" prefix={<ProjectOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="技术栈" value={15} suffix="+" prefix={<CodeOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderProjects = () => (
    <div style={{ padding: '40px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>项目经验</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {projects.map((project, index) => (
          <Card key={index} style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <img 
                  alt={project.title} 
                  src={project.image} 
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '8px' }} 
                />
              </Col>
              <Col xs={24} md={16}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>{project.title}</Title>
                  <Text type="secondary">{project.company} | {project.role}</Text>
                  <br />
                  <Text type="secondary">{project.duration}</Text>
                </div>
                
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {project.description}
                </Paragraph>

                <div style={{ marginBottom: 16 }}>
                  {project.tags.map(tag => (
                    <Tag key={tag} color="blue" style={{ marginBottom: 8 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  {project.metrics.map((metric, idx) => (
                    <Col key={idx}>
                      <Statistic 
                        title={metric.label} 
                        value={metric.value} 
                        valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                      />
                    </Col>
                  ))}
                </Row>

                <div>
                  <Text strong>主要贡献：</Text>
                  <ul style={{ marginTop: 8 }}>
                    {project.highlights.map((highlight, idx) => (
                      <li key={idx} style={{ fontSize: '14px', marginBottom: 4 }}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </Space>
    </div>
  );

  const renderAbout = () => (
    <div style={{ padding: '40px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>技能与经历</Title>
      
      <Row gutter={[40, 40]}>
        <Col xs={24} lg={12}>
          <Card title="技术技能" extra={<CodeOutlined />}>
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category} style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 12 }}>{category}</Title>
                <div>
                  {skillList.map(skill => (
                    <Tag key={skill} color="green" style={{ margin: '4px', padding: '8px 12px', fontSize: '14px' }}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="工作经历" extra={<TeamOutlined />}>
            <Timeline>
              {experiences.map((exp, index) => (
                <Timeline.Item key={index}>
                  <div>
                    <Text strong style={{ color: '#1890ff' }}>{exp.year}</Text>
                    <br />
                    <Text strong>{exp.company} - {exp.role}</Text>
                    <br />
                    <Text type="secondary">{exp.content}</Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 40 }}>
        <Col xs={24}>
          <Card title="教育背景" extra={<TrophyOutlined />}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Statistic title="学校" value={education.school} />
              </Col>
              <Col xs={24} md={8}>
                <Statistic title="专业" value={education.major} />
              </Col>
              <Col xs={24} md={8}>
                <Statistic title="GPA" value={education.gpa} />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text strong>主要课程：</Text>
              <div style={{ marginTop: 8 }}>
                {education.courses.map(course => (
                  <Tag key={course} style={{ margin: '4px' }}>
                    {course}
                  </Tag>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const menuItems = [
    { key: 'home', label: '个人简介', icon: <UserOutlined /> },
    { key: 'projects', label: '项目经验', icon: <ProjectOutlined /> },
    { key: 'about', label: '技能经历', icon: <TrophyOutlined /> }
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'home':
        return renderHome();
      case 'projects':
        return renderProjects();
      case 'about':
        return renderAbout();
      default:
        return renderHome();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ float: 'left', fontSize: '22px', fontWeight: 'bold', color: '#1890ff' }}>
          <RocketOutlined style={{ marginRight: 8 }} />
          张三 - 高级前端工程师
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[currentSection]}
          items={menuItems}
          onClick={({ key }) => setCurrentSection(key)}
          style={{ lineHeight: '64px', borderBottom: 'none', float: 'right' }}
        />
      </Header>
      
      <Content style={{ padding: '0 50px', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', margin: '24px 0', borderRadius: '12px', minHeight: 'calc(100vh - 200px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {renderContent()}
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', background: '#f0f2f5', padding: '24px 50px' }}>
        <div style={{ marginBottom: 8 }}>
          <Space>
            <MailOutlined /> zhangsan@example.com
            <PhoneOutlined /> +86 138-0000-0000
            <EnvironmentOutlined /> 北京
          </Space>
        </div>
        <div>
          © {new Date().getFullYear()} 张三的个人简历 | 由 React + Vite + Ant Design 构建
        </div>
      </Footer>
    </Layout>
  );
}

export default App; 