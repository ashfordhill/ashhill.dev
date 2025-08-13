import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Link,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';

// Local types since we're not using API routes anymore
interface ConversationMessage {
  speaker: 'Idealist' | 'Cost Cutter';
  model: string;
  message: string;
}

interface AIDesignTheaterData {
  topic: string;
  created: string;
  project: string;
  diagramSvg?: string;
  conversation: ConversationMessage[];
}

const CACHE_KEY = 'llm-drama-data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const LLMDramaSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];
  
  const [data, setData] = useState<AIDesignTheaterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = (): AIDesignTheaterData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp < CACHE_DURATION) {
        console.log('Using cached LLM Drama data');
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error reading cache:', err);
      return null;
    }
  };

  const setCachedData = (data: AIDesignTheaterData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error setting cache:', err);
    }
  };

  const parseReadmeContent = (content: string): AIDesignTheaterData => {
    try {
      // ---------- Basic metadata ----------
      let topic = 'AI Design Theater';
      const topicMatch = content.match(/>\s*\*\*Topic:\*\*\s*([^\n\r]+)/);
      if (topicMatch) topic = topicMatch[1].trim();

      let created = new Date().toISOString();
      const createdMatch = content.match(/>\s*\*\*Created:\*\*\s*([^\n\r]+)/);
      if (createdMatch) {
        const d = createdMatch[1].match(/(\d{4}-\d{2}-\d{2})/);
        if (d) created = d[1] + 'T12:00:00Z';
      }

      let diagramSvg = '';
      const diagramMatch = content.match(/!\[Diagram\]\(([^)]+)\)/);
      if (diagramMatch) {
        diagramSvg = diagramMatch[1];
        if (diagramSvg.startsWith('projects/')) {
          diagramSvg = `https://raw.githubusercontent.com/ashfordhill/AI-design-theater/main/${diagramSvg}`;
        }
      }

      // ---------- Conversation extraction ----------
      const conversation: ConversationMessage[] = [];
      // Restrict to the Design Conversation block first for speed
      const convoBlockMatch = content.match(/##[^\n]*Design Conversation[\s\S]*?<\/details>/i);
      let convoBlock = convoBlockMatch ? convoBlockMatch[0] : '';
      if (!convoBlock) {
        // fallback to whole content
        convoBlock = content;
      }

      // Isolate the <details>...</details> section if present
      const detailsOnly = convoBlock.match(/<details>[\s\S]*?<\/details>/i);
      if (detailsOnly) convoBlock = detailsOnly[0];

      // Remove leading blockquote markers and HTML container tags that just wrap messages
      convoBlock = convoBlock
        .replace(/^> ?/gm, '')
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<details>|<summary>[\s\S]*?<\/summary>/gi, '')
        .replace(/<\/details>/gi, '')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');

      // Find all speaker headers with their indices
      const headerRegex = /\*\*.*?(Idealist|Cost Cutter).*?\*\*\s*\*\(([^)]+)\)\*/g;
      const headers: { index: number; speaker: 'Idealist' | 'Cost Cutter'; model: string }[] = [];
      let headerMatch: RegExpExecArray | null;
      while ((headerMatch = headerRegex.exec(convoBlock)) !== null) {
        headers.push({
          index: headerMatch.index,
          speaker: headerMatch[1] as 'Idealist' | 'Cost Cutter',
          model: headerMatch[2].toLowerCase().replace(/^(anthropic|openai):\s*/, '')
        });
      }

      for (let i = 0; i < headers.length; i++) {
        const start = headers[i].index;
        const end = i + 1 < headers.length ? headers[i + 1].index : convoBlock.length;
        // Slice from end of header line
        const afterHeader = convoBlock.slice(start, end).replace(/^.*?\*\*$/m, '');
        // Remove the header itself
        const body = afterHeader.replace(/^[^\n]*\*\([^)]*\)\*\s*/,'');
        let message = body
          .replace(/\*\*.*?\*\*/,'')
          .replace(/\*\([^)]*\)\*/,'')
          .replace(/```[\s\S]*?```/g,'') // strip code blocks if any
          .replace(/<[^>]*>/g,'')
          .replace(/\r/g,'')
          .split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.startsWith('#'))
          .join(' ')
          .replace(/\s+/g,' ') // collapse spaces
          .trim();
        if (message.length > 20) {
          conversation.push({
            speaker: headers[i].speaker,
            model: headers[i].model,
            message
          });
        }
      }

      console.log(`Parsed ${conversation.length} conversation messages`);

      return { topic, created, project: 'ai-design-theater', diagramSvg, conversation };
    } catch (err) {
      console.error('Error parsing README:', err);
      throw new Error('Failed to parse README content');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
        
        console.log('Fetching README from GitHub...');
        
        // NO MORE API CALL - Fetch README directly from GitHub raw content
        const response = await fetch(
          'https://raw.githubusercontent.com/ashfordhill/AI-design-theater/main/README.md',
          {
            headers: {
              'Accept': 'text/plain',
            },
            cache: 'no-cache'
          }
        );
        
        if (!response.ok) {
          throw new Error(`GitHub fetch failed: ${response.status}`);
        }
        
        const readmeContent = await response.text();
        console.log('README fetched, content length:', readmeContent.length);
        console.log('First 1000 characters:', readmeContent.substring(0, 1000));
        console.log('Looking for conversation section...');
        
        const parsedData = parseReadmeContent(readmeContent);
        console.log('Parsed data:', parsedData);
        
        if (parsedData.conversation.length === 0) {
          console.warn('No conversation messages parsed; will show metadata only');
          setError('No conversation messages parsed');
        } else {
          // Cache only if we have at least one message
          setCachedData(parsedData);
        }
        setData(parsedData);
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        
        // Fallback data for when GitHub is unreachable
        console.log('Using fallback data due to error');
        setData({
          topic: 'Microservices vs Monolith Architecture (Demo)',
          created: new Date().toISOString(),
          project: 'demo_project',
          diagramSvg: '',
          conversation: [
            {
              speaker: 'Idealist',
              model: 'claude-3-5-sonnet',
              message: 'Monoliths? Seriously? It\'s 2025! We need a full microservices architecture with event-driven communication, CQRS, and domain-driven design. Anything less is technical debt waiting to happen!'
            },
            {
              speaker: 'Cost Cutter',
              model: 'gpt-4o-mini',
              message: 'Oh great, another microservices evangelist! Do you have any idea how much operational overhead that creates? Network latency, distributed tracing, service discovery... we\'ll spend more on DevOps than development!'
            },
            {
              speaker: 'Idealist',
              model: 'claude-3-5-sonnet',
              message: 'That\'s the beauty of modern cloud platforms! Kubernetes handles orchestration, service mesh manages communication, and observability tools make monitoring trivial. It\'s never been easier!'
            },
            {
              speaker: 'Cost Cutter',
              model: 'gpt-4o-mini',
              message: 'Trivial? Have you seen our cloud bills lately? Plus, debugging distributed systems is a nightmare. When something breaks, good luck figuring out which of your 47 microservices is the culprit!'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Include timezone abbreviation
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const getSpeakerColor = (speaker: 'Idealist' | 'Cost Cutter') => {
    return speaker === 'Idealist' ? palette.primary : palette.secondary;
  };

  const getSpeakerIcon = (speaker: 'Idealist' | 'Cost Cutter') => {
    return speaker === 'Idealist' ? '🧠' : '🤖';
  };

  if (loading) {
    return (
      <Box sx={{ 
        maxWidth: '100%',
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
        height: '100%',
        overflow: 'auto'
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mx: 'auto', mt: 1 }} />
        </Box>
        
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ 
            mb: 3, 
            display: 'flex', 
            gap: 2,
            flexDirection: i % 2 === 0 ? 'row-reverse' : 'row'
          }}>
            <Skeleton variant="circular" width={50} height={50} />
            <Box sx={{ flex: 1, maxWidth: { xs: '100%', sm: '80%', md: '70%' } }}>
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="rectangular" height={80} sx={{ mt: 1, borderRadius: 2 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        maxWidth: '100%',
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 } 
      }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error} - Showing demo data
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ 
        maxWidth: '100%',
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 } 
      }}>
        <Alert severity="info">
          No data available
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '100%',
      mx: 'auto',
      height: '100%',
      overflow: 'auto',
      p: { xs: 2, sm: 3, md: 4 },
      background: `linear-gradient(135deg, ${palette.background}F0 0%, ${palette.primary}05 50%, ${palette.secondary}05 100%)`,
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: palette.text,
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
          }}
        >
          🎭 AI Design Theater
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            color: palette.primary,
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
          }}
        >
          {data.topic}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Chip 
            label={`Generated ${formatDate(data.created)}`}
            sx={{ 
              backgroundColor: palette.primary + '20',
              color: palette.primary,
              fontWeight: 500
            }}
          />
          <Chip 
            label="New idea generated daily"
            sx={{ 
              backgroundColor: palette.secondary + '20',
              color: palette.secondary,
              fontWeight: 500
            }}
          />
        </Box>

        <Typography 
          variant="body1" 
          sx={{ 
            color: palette.text,
            mt: 2,
            fontStyle: 'italic',
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          Watch two AI models duke it out over software design decisions!
        </Typography>
      </Box>

      {/* Diagram Section */}
      {data.diagramSvg && (
        <Accordion defaultExpanded={false} sx={{ mb: 4, backgroundColor: palette.background + 'E0', border: `1px solid ${palette.border}40`, borderRadius: '12px !important' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: palette.primary }} />}>
            <Typography sx={{ color: palette.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              📊 Architecture Diagram
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ 
              maxWidth: '100%',
              overflow: 'hidden',
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1
              }
            }}>
              <img src={data.diagramSvg} alt="Architecture Diagram" />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Conversation Section */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: palette.text,
            fontWeight: 600,
            mb: 3,
            textAlign: 'center',
            fontSize: { xs: '1.3rem', sm: '1.5rem' }
          }}
        >
          � The Conversation
        </Typography>

        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: { xs: '100%', sm: '900px', md: '1000px' },
          mx: 'auto'
        }}>
          {data.conversation.length === 0 && (
            <Alert severity="info" sx={{ opacity: 0.8 }}>
              No parsed conversation messages found in today's README yet. The daily job may still be running.
            </Alert>
          )}
          {data.conversation.map((message, index) => (
            <ConversationBubble
              key={index}
              message={message}
              palette={palette}
              isEven={index % 2 === 0}
            />
          ))}
        </Box>
      </Box>

      {/* Footer (simplified) */}
      <Box sx={{ textAlign: 'center', mt: 4, pb: 1 }}>
        <Link 
          href="https://github.com/ashfordhill/AI-design-theater" 
          target="_blank"
          sx={{ color: palette.primary, fontSize: '0.75rem' }}
        >
          Source & history on GitHub
        </Link>
      </Box>
    </Box>
  );
};

interface ConversationBubbleProps {
  message: ConversationMessage;
  palette: any;
  isEven: boolean;
}

const ConversationBubble: React.FC<ConversationBubbleProps> = ({ message, palette, isEven }) => {
  const speakerColor = message.speaker === 'Idealist' ? palette.primary : palette.secondary;
  const isIdealist = message.speaker === 'Idealist';

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: isIdealist ? 'row' : 'row-reverse' },
      alignItems: 'flex-start',
      gap: 2,
      maxWidth: '100%'
    }}>
      {/* Avatar */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: 'center',
        gap: 1,
        minWidth: 'fit-content'
      }}>
        <Avatar sx={{
          backgroundColor: speakerColor,
          color: 'white',
          fontWeight: 'bold',
          width: { xs: 45, sm: 50 },
          height: { xs: 45, sm: 50 },
          fontSize: { xs: '1.2rem', sm: '1.5rem' }
        }}>
          {message.speaker === 'Idealist' ? '🧠' : '💰'}
        </Avatar>
        
        <Box sx={{ 
          textAlign: { xs: 'left', sm: 'center' },
          minWidth: 'fit-content'
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: speakerColor,
              fontWeight: 600,
              display: 'block',
              fontSize: { xs: '0.75rem', sm: '0.8rem' }
            }}
          >
            {message.speaker}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: palette.text,
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            {message.model}
          </Typography>
        </Box>
      </Box>

      {/* Message */}
      <Paper sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: isIdealist 
          ? palette.primary + '10' 
          : palette.secondary + '10',
        border: `1px solid ${speakerColor}30`,
        borderRadius: '16px',
        maxWidth: { xs: '100%', sm: '85%', md: '75%' },
        minWidth: { xs: '100%', sm: '300px' },
        position: 'relative',
        
        // Speech bubble tail
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 20,
          [isIdealist ? 'left' : 'right']: { xs: 20, sm: -8 },
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: { 
            xs: '0 8px 8px 8px',
            sm: isIdealist ? '8px 8px 8px 0' : '8px 0 8px 8px'
          },
          borderColor: { 
            xs: `transparent transparent ${speakerColor}30 transparent`,
            sm: isIdealist 
              ? `transparent ${speakerColor}30 transparent transparent`
              : `transparent transparent transparent ${speakerColor}30`
          },
          display: { xs: 'none', sm: 'block' }
        }
      }}>
        <Typography 
          variant="body1" 
          sx={{ 
            color: palette.text,
            lineHeight: 1.6,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          {message.message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default LLMDramaSection;