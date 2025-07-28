import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { MessageSquare, Send, Search, Filter, Plus, Users, MoreVertical, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { chatsService, Chat, Message, CreateChatDto } from '../services/chatsService';
import { usersService } from '../services/usersService';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [companyMembers, setCompanyMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState<CreateChatDto>({
    name: '',
    description: '',
    type: 'group',
    participantIds: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    loadCompanyMembers();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const chatsData = await chatsService.getChats();
      setChats(chatsData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyMembers = async () => {
    try {
      const members = await usersService.getCompanyMembers();
      if (Array.isArray(members)) {
        setCompanyMembers(members);
      } else {
        console.error('Company members is not an array:', members);
      }
    } catch (error) {
      console.error('Error loading company members:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const messagesData = await chatsService.getMessages(chatId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      const newMessage = await chatsService.sendMessage(selectedChat.id, { content: messageText });
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createGroup = async () => {
    if (!newGroupData.name.trim() || !newGroupData.participantIds?.length) return;

    try {
      const newChat = await chatsService.createChat(newGroupData);
      setChats(prev => [newChat, ...prev]);
      setShowCreateGroup(false);
      setNewGroupData({ name: '', description: '', type: 'group', participantIds: [] });
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participants.some(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return messageDate.toLocaleDateString([], { weekday: 'long' });
    return messageDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  if (selectedChat) {
    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChat(null)}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{selectedChat.name}</h2>
              <p className="text-sm text-gray-500">
                {selectedChat.participants.length} participants
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical size={20} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.author.id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.author.id === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.author.firstName} {message.author.lastName}
                </div>
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.author.id === user?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              fullWidth
            />
            <Button onClick={sendMessage} disabled={!messageText.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Communicate with your team</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateGroup(true)}
          >
            New Group
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                leftIcon={<Search size={18} />}
              />
            </div>
            <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateGroup ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Create New Group</h3>
              <Input
                placeholder="Group name"
                value={newGroupData.name}
                onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
              />
              <Input
                placeholder="Description (optional)"
                value={newGroupData.description}
                onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
              />
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Select Participants ({companyMembers.filter(member => member.id !== user?.id).length} available)
                 </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                                     {companyMembers.length === 0 ? (
                     <div className="text-sm text-gray-500 p-2">No company members found</div>
                   ) : (
                     companyMembers
                       .filter(member => member.id !== user?.id) // Исключаем текущего пользователя
                       .map((member) => (
                         <label key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                           <input
                             type="checkbox"
                             checked={newGroupData.participantIds?.includes(member.id)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setNewGroupData(prev => ({
                                   ...prev,
                                   participantIds: [...(prev.participantIds || []), member.id]
                                 }));
                               } else {
                                 setNewGroupData(prev => ({
                                   ...prev,
                                   participantIds: prev.participantIds?.filter(id => id !== member.id) || []
                                 }));
                               }
                             }}
                           />
                           <span className="text-sm">
                             {member.firstName} {member.lastName} ({member.email})
                           </span>
                         </label>
                       ))
                   )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={createGroup} disabled={!newGroupData.name || !newGroupData.participantIds?.length}>
                  Create Group
                </Button>
                <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{chat.name}</h3>
                      {chat.lastMessageAt && (
                        <span className="text-xs text-gray-500">
                          {formatDate(chat.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {chat.participants.length} participants
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
              <p className="text-sm text-gray-500">
                Start a conversation with your team
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages; 