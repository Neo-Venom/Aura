import { useParams } from 'react-router-dom';
import { ChatView } from '../components/chat/ChatView';

export default function Conversation() {
  const { sessionId = '' } = useParams();
  return <ChatView key={sessionId} sessionId={sessionId} />;
}
